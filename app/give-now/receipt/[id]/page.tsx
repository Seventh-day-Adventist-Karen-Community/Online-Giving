import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FetchTransactionReceipt } from "@data/mpesa";
import { Constants } from "@utils/constants";
import { HashString } from "@utils/hash-string";
import Download from "./download";

export const metadata: Metadata = {
  title: "Contribution Receipt | Karen Community SDA",
  description: "Contribution Receipt | Seventh Day Adventist Church Karen Community",
  robots: { index: false, follow: false },
};

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { result: data, error } = await FetchTransactionReceipt(id);

  if (error) {
    return (
      <div className="px-4 py-16 min-h-screen text-center text-gray-700">
        <p className="font-semibold">{error}</p>
        <Link href="/" className="mt-4 inline-block font-medium hover:underline">
          Back to giving
        </Link>
      </div>
    );
  }
  if (!data) return notFound();

  return (
    <div className="px-4 md:px-8 py-6 min-h-screen font-sans">
      <div className="py-3">
        <div className="mt-6 flex flex-col gap-y-2 relative xl:mx-5 border-2 border-slate-500">
          <div className="text-lg px-1.5 font-bold pt-2 text-end">Karen Community SDA Church</div>
          <div className="flex flex-row justify-between text-sm">
            <div className="w-1/2 px-1.5">
              <div className="font-bold">{data.name}</div>
              <div>{HashString(data.email)}</div>
              <div>{HashString(data.phone)}</div>
            </div>
            <div className="text-end w-1/2 px-1.5">
              <div>
                Receipt# <span className="font-bold break-keep">{data.no}</span>
              </div>
              <div>{data.paymentMode}</div>
              <div>{new Date(data.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          <table className="border-collapse border border-slate-500 table-auto">
            <thead>
              <tr>
                <th className="border bg-slate-300 py-2 px-1.5 text-start border-slate-600">Line Items</th>
                <th className="border bg-slate-300 py-2 px-1.5 border-slate-600 text-end">Amount (KES)</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map((line) => (
                <tr key={line.code} className="text-gray-700 text-sm">
                  <td className="border py-1 px-1.5 border-slate-700 text-start">{line.name}</td>
                  <td className="border py-1 px-1.5 border-slate-700 text-end">{line.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td className="border bg-slate-300 py-2 px-1.5 border-slate-600 text-end font-bold">Total (KES)</td>
                <td className="border bg-slate-300 py-2 px-1.5 border-slate-600 text-end font-bold">
                  {data.amount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex flex-col pb-2 px-1.5">
            <h5 className="font-bold">Queries/Concerns:</h5>
            <a href={`tel:${Constants.TREASURY_PHONE}`} className="hover:text-maroon-600 text-sm">
              Phone: {Constants.TREASURY_PHONE}
            </a>
            <a href={`mailto:${Constants.TREASURY_EMAIL}`} className="hover:text-maroon-600 text-sm">
              Email: {Constants.TREASURY_EMAIL}
            </a>
          </div>
        </div>

        <div className="text-xs flex gap-3 font-light text-center text-gray-700 pt-3 pb-5 w-full justify-center">
          <Download data={data} />
          <Link href="/" className="font-medium hover:underline">
            Give Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
