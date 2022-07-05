import gql from "graphql-tag";

export const getSummoners = gql`
  query getSummoners($first: Int! = 1000, $owner: String!) {
    summoners(
      first: $first
      where: { owner: $owner }
      orderBy: id
      orderDirection: desc
    ) {
      id
    }
  }
`;
