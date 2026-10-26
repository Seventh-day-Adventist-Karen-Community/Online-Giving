import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

// Server-side only. Configure with GRAPHQL_URL (see .env.example).
const uri = process.env.GRAPHQL_URL ?? "https://admin.sdackc.org/graphql/";

const client = new ApolloClient({
  link: new HttpLink({ uri, fetchOptions: { cache: "no-store" } }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: "no-cache" },
    mutate: { fetchPolicy: "no-cache" },
  },
});

export default client;
