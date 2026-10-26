"use server";

import { gql } from "@apollo/client";
import client from "./apollo-client";
import type {
	ActionResult,
	ChurchUnitType,
	InitiatedPaymentType,
	MpesaType,
	PaidTransactionType,
	PaymentType,
} from "./types";

const messageOf = (e: unknown, fallback: string) =>
	e instanceof Error && e.message ? e.message : fallback;

// Relay global IDs are base64("TypeName:pk"). The `unit` mutation argument wants the raw pk.
const decodeGlobalIdToPk = (globalId: string): number | undefined => {
	try {
		const [, pk] = Buffer.from(globalId, "base64")
			.toString("utf-8")
			.split(":");
		return pk ? Number(pk) : undefined;
	} catch {
		return undefined;
	}
};

// IDs arrive url-encoded in route params ("=" padding becomes %3D).
const normifyB64 = (id: string) => id.replaceAll("%3D", "=");

export async function FetchPaymentTypes(): Promise<
	ActionResult<PaymentType[]>
> {
	try {
		const { data } = await client.query<{
			paymentTypes: { edges: { node: PaymentType }[] };
		}>({
			query: gql`
				query PaymentTypes {
					paymentTypes(active: true) {
						edges {
							node {
								code
								id
								description
								priority
								sequenceNo
								name
							}
						}
					}
				}
			`,
		});
		return { result: (data?.paymentTypes.edges ?? []).map((e) => e.node) };
	} catch (e) {
		return {
			error: messageOf(
				e,
				"Could not load giving categories. Please try again.",
			),
		};
	}
}

export async function FetchChurchUnits(): Promise<
	ActionResult<ChurchUnitType[]>
> {
	try {
		const { data } = await client.query<{
			churchUnits: { edges: { node: { id: string; name: string } }[] };
		}>({
			query: gql`
				query ChurchUnits {
					churchUnits {
						edges {
							node {
								id
								name
							}
						}
					}
				}
			`,
		});
		const units = (data?.churchUnits.edges ?? []).flatMap(({ node }) => {
			const pk = decodeGlobalIdToPk(node.id);
			return pk === undefined || Number.isNaN(pk)
				? []
				: [{ ...node, pk }];
		});
		return { result: units };
	} catch (e) {
		return {
			error: messageOf(
				e,
				"Could not load church units. Please try again.",
			),
		};
	}
}

export async function PostMpesa(
	form: Pick<MpesaType, "name" | "phone" | "email" | "unit" | "lines">,
): Promise<ActionResult<InitiatedPaymentType>> {
	const lines = (form.lines ?? [])
		.filter((line) => line != null)
		.map((line) => ({
			code: String(line.code),
			amount: String(line.amount).trim(),
		}))
		.filter((line) => {
			const amount = Number(line.amount);
			return (
				line.code.length > 0 &&
				line.amount.length > 0 &&
				Number.isFinite(amount) &&
				amount > 0
			);
		});

	if (lines.length === 0) {
		return {
			error: "Oops! It looks like there are no valid contributions entered. Please check and try again.",
		};
	}

	try {
		const { data } = await client.mutate<{
			initiateMpesaExpressPayment: {
				initiateMpesaExpress: InitiatedPaymentType | null;
			} | null;
		}>({
			mutation: gql`
				mutation CreateMpesa(
					$phone: String!
					$email: String!
					$name: String!
					$lines: [InitiateLineType]!
					$unit: Int
				) {
					initiateMpesaExpressPayment(
						input: {
							phone: $phone
							email: $email
							name: $name
							lines: $lines
							unit: $unit
						}
					) {
						initiateMpesaExpress {
							CheckoutRequestID
							MerchantRequestID
							ResultCode
							externalReference
							ResultDescription
							mode
							reference
							id
						}
					}
				}
			`,
			variables: {
				phone: String(form.phone).trim(),
				email: String(form.email ?? "").trim(),
				name: String(form.name).trim(),
				unit: form.unit ? Number(form.unit) : null,
				lines,
			},
		});

		const result = data?.initiateMpesaExpressPayment?.initiateMpesaExpress;

		if (!result) {
			return {
				error: "The payment could not be started. Please try again.",
			};
		}

		return { result };
	} catch (e) {
		console.error(
			"PostMpesa GraphQL mutation failed:",
			messageOf(e, "Unknown error"),
		);

		return {
			error: messageOf(
				e,
				"Something went wrong while initiating your payment. Please try again.",
			),
		};
	}
}

export async function ConfirmStatus(
	reference: string,
): Promise<ActionResult<InitiatedPaymentType>> {
	try {
		const { data } = await client.query<{
			initiatedPayment: InitiatedPaymentType | null;
		}>({
			query: gql`
				query initiatedPayment($transId: ID!) {
					initiatedPayment(id: $transId) {
						CheckoutRequestID
						MerchantRequestID
						ResultCode
						externalReference
						reference
						state
						ResultDescription
					}
				}
			`,
			variables: { transId: normifyB64(reference) },
		});
		if (!data?.initiatedPayment)
			return {
				error: "A transaction with that reference was not found.",
			};
		return { result: data.initiatedPayment };
	} catch (e) {
		return { error: messageOf(e, "Could not confirm the payment status.") };
	}
}

export async function FetchTransactionReceipt(
	reference: string,
): Promise<ActionResult<PaidTransactionType | null>> {
	type TransactionNode = Omit<PaidTransactionType, "lines"> & {
		transactionLines: {
			edges: {
				node: {
					amount: number;
					paymentType: {
						code: string;
						description: string;
						name: string;
					};
				};
			}[];
		};
	};
	try {
		const { data } = await client.query<{
			transactions: { edges: { node: TransactionNode }[] };
		}>({
			query: gql`
				query Transactions($reference: String) {
					transactions(reference: $reference) {
						edges {
							node {
								id
								no
								notified
								reference
								phone
								paymentMode
								createdAt
								confirmationCode
								amount
								email
								name
								transactionLines {
									edges {
										node {
											amount
											createdAt
											id
											paymentType {
												code
												description
												name
												sequenceNo
											}
										}
									}
								}
								status
							}
						}
					}
				}
			`,
			variables: { reference: normifyB64(reference) },
		});
		const node = data?.transactions.edges[0]?.node;
		if (!node) return { result: null };
		const { transactionLines, ...rest } = node;
		return {
			result: {
				...rest,
				lines: transactionLines.edges.map(({ node: line }) => ({
					amount: line.amount,
					...line.paymentType,
				})),
			},
		};
	} catch (e) {
		return { error: messageOf(e, "Could not load the receipt.") };
	}
}
