import { AppProps } from "next/app";
import { Fragment } from "react";
import Head from "next/head";
import "../styles/index.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Fragment>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
        <title key="title">Arising: Migration Website</title>

        <meta
          key="description"
          name="description"
          content="Utility website to migrate the Rarity Manifested summoners and assets to Arising."
        />

        <meta name="application-name" content="Arising: Migration Website" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta
          name="apple-mobile-web-app-title"
          content="Arising: Migration Website"
        />

        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#022127" />

        <meta key="twitter:card" name="twitter:card" content="app" />
        <meta
          key="twitter:title"
          name="twitter:title"
          content="Arising: Migration Website"
        />
        <meta
          key="twitter:url"
          name="twitter:url"
          content="https://migrate.playarising.com"
        />

        <meta
          key="twitter:description"
          name="twitter:description"
          content="Utility website to migrate the Rarity Manifested summoners and assets to Arising."
        />
        <meta
          key="twitter:image"
          name="twitter:image"
          content="https://migrate.playarising.com/ms-icon-310x310.png"
        />
        <meta
          key="twitter:creator"
          name="twitter:creator"
          content="Utility website to migrate the Rarity Manifested summoners and assets to Arising."
        />
        <meta key="og:type" property="og:type" content="website" />
        <meta
          key="og:site_name"
          property="og:site_name"
          content="Arising: Migration Website"
        />
        <meta
          key="og:url"
          property="og:url"
          content="https://migrate.playarising.com"
        />
        <meta
          key="og:image"
          property="og:image"
          content="https://migrate.playarising.com/ms-icon-310x310.png"
        />
        <meta
          key="og:description"
          property="og:description"
          content="Utility website to migrate the Rarity Manifested summoners and assets to Arising."
        />
      </Head>
      <Component {...pageProps} />
    </Fragment>
  );
}

export default MyApp;
