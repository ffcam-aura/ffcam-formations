import { NextPageContext } from "next";

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>{statusCode || "Erreur"}</h1>
      <p>
        {statusCode === 404
          ? "Cette page est introuvable."
          : "Une erreur est survenue."}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
