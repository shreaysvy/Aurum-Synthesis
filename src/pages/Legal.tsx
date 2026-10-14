import { DocPage } from './Doc';

const UPDATED = '14 October 2026';

export function RiskDisclosure() {
  return (
    <DocPage
      kicker="Mandatory disclosure"
      title="Risk disclosure and data provenance"
      standfirst="Read this before drawing any conclusion from anything this application displays."
      updated={UPDATED}
      sections={[
        {
          n: '01',
          title: 'All market data here is generated',
          body: (
            <>
              <p>
                Every price, spread, volume, open interest figure and z-score shown in this application is
                produced by a local random process. No value is received from MCX, from COMEX, from any
                broker, or from any market data vendor. No figure represents an actual exchange quote at
                any time, past or present.
              </p>
              <p>
                The pricing and cost models are genuine implementations of the formulas set out in the
                methodology note. The inputs they are fed are not.
              </p>
            </>
          ),
        },
        {
          n: '02',
          title: 'The backtest is illustrative',
          body: (
            <p>
              The performance figures on the Backtest view, including the trade count, win rate, Sharpe
              ratios, profit factor and equity curve, are a fixed illustrative sample. They are not the
              output of running the strategy against historical data. They must not be represented to
              anyone as a track record, a simulation result, or evidence that the approach is profitable.
            </p>
          ),
        },
        {
          n: '03',
          title: 'Nothing here is investment advice',
          body: (
            <>
              <p>
                This application is a demonstration of a pricing methodology. It is not investment advice,
                not a recommendation to buy or sell any instrument, and not a solicitation. It is not
                provided by a registered investment adviser or a registered research analyst.
              </p>
              <p>
                Commodity derivatives are leveraged instruments. Losses can exceed the margin deposited.
                Anyone considering a position should consult a SEBI registered adviser and read the
                relevant exchange risk disclosure documents.
              </p>
            </>
          ),
        },
        {
          n: '04',
          title: 'Model limitations',
          body: (
            <p>
              The cost model applies published statutory rates that are subject to change by the exchange,
              by SEBI and by the Union Budget. Margin requirements are approximated and rise inside tender
              windows. Historical spread parameters are fixed constants rather than rolling estimates. The
              methodology note sets out these limitations in full.
            </p>
          ),
        },
      ]}
    />
  );
}

export function Terms() {
  return (
    <DocPage
      kicker="Legal"
      title="Terms of service"
      standfirst="The conditions under which this demonstration application is made available."
      updated={UPDATED}
      sections={[
        {
          n: '01',
          title: 'What this service is',
          body: (
            <p>
              Aurum Synthesis is a demonstration of a derivatives pricing methodology, provided for
              educational and illustrative purposes. It is not a trading venue, a broker, a market data
              service or an advisory service. No order placed in this application reaches any exchange.
            </p>
          ),
        },
        {
          n: '02',
          title: 'Accounts',
          body: (
            <>
              <p>
                An account may be created with a Google sign-in or with an email address and passphrase.
                A guest session is also available and stores no durable profile. You are responsible for
                maintaining the confidentiality of your credentials.
              </p>
              <p>
                Accounts may be suspended or removed at any time. You may delete your account and the
                profile record associated with it from the Account page.
              </p>
            </>
          ),
        },
        {
          n: '03',
          title: 'No warranty',
          body: (
            <p>
              The service is provided as is, without warranty of any kind, express or implied, including
              warranties of merchantability, fitness for a particular purpose and non-infringement. The
              data shown is generated and carries no representation of accuracy, because it represents
              nothing.
            </p>
          ),
        },
        {
          n: '04',
          title: 'Limitation of liability',
          body: (
            <p>
              To the maximum extent permitted by law, no liability is accepted for any loss or damage
              arising from use of this application, including any trading loss incurred by a person who
              acted on a figure displayed here. The risk disclosure explains why no figure here should be
              acted upon.
            </p>
          ),
        },
        {
          n: '05',
          title: 'Acceptable use',
          body: (
            <p>
              You may not misrepresent output from this application as live market data, as a verified
              track record, or as professional advice. You may not attempt to disrupt the service or
              access accounts that are not yours.
            </p>
          ),
        },
        {
          n: '06',
          title: 'Changes and governing law',
          body: (
            <p>
              These terms may be revised, with the revision date shown above. Continued use after a
              revision constitutes acceptance. These terms are governed by the laws of India, and the
              courts at Mumbai have exclusive jurisdiction.
            </p>
          ),
        },
      ]}
    />
  );
}

export function Privacy() {
  return (
    <DocPage
      kicker="Legal"
      title="Privacy policy"
      standfirst="What this application stores, where it stores it, and how to have it removed."
      updated={UPDATED}
      sections={[
        {
          n: '01',
          title: 'What is collected',
          body: (
            <>
              <p>
                When you sign in, a profile record is written to Google Firestore containing your account
                identifier, your email address, your display name, your profile image URL where one is
                supplied by the sign-in provider, the authentication method used, and the timestamp of
                your most recent sign-in.
              </p>
              <p>
                A guest session writes the same record with a placeholder email and a generated display
                name. No other personal data is collected.
              </p>
            </>
          ),
        },
        {
          n: '02',
          title: 'What is not collected',
          body: (
            <p>
              No analytics, advertising or third party tracking is loaded. No behavioural profile is built.
              Your interactions with the terminal, including any simulated position you record, stay in
              your browser and are not transmitted or stored.
            </p>
          ),
        },
        {
          n: '03',
          title: 'Local storage',
          body: (
            <p>
              Your theme preference and session marker are kept in your browser's local and session
              storage. They remain on your device, are readable only by this application, and can be
              cleared through your browser at any time.
            </p>
          ),
        },
        {
          n: '04',
          title: 'Processors',
          body: (
            <p>
              Authentication and the profile record are handled by Google Firebase, acting as a processor.
              Fonts are served by Google Fonts, which receives a request from your browser carrying your
              IP address. No other third party receives data from this application.
            </p>
          ),
        },
        {
          n: '05',
          title: 'Access and deletion',
          body: (
            <p>
              You may view the profile record held about you, and delete it together with your account,
              from the Account page. Deletion is immediate and irreversible. Firestore access rules deny
              all reads and writes except by the owner of a record.
            </p>
          ),
        },
        {
          n: '06',
          title: 'Contact',
          body: (
            <p>
              Questions about this policy, or a request relating to your data, can be raised through the
              account owner of this deployment.
            </p>
          ),
        },
      ]}
    />
  );
}
