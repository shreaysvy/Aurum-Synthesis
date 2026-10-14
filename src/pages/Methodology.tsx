import { DocPage, Formula } from './Doc';

export function Methodology() {
  return (
    <DocPage
      kicker="Technical note"
      title="How synthetic fair value is derived"
      standfirst="This note sets out every formula the terminal uses, every rate it applies, and the limitations a reader should hold against it. If a number on screen cannot be traced back to this page, treat it as unsupported."
      updated="14 October 2026"
      sections={[
        {
          n: '01',
          title: 'The import parity argument',
          body: (
            <>
              <p>
                Gold in a Mumbai vault is gold that was bought abroad, shipped, cleared through customs,
                assayed and stored. Its fair price in rupees is therefore a landed cost, and landed cost
                is computable from observable inputs rather than inferred from sentiment.
              </p>
              <Formula>{`SFV = (COMEX / 31.1034768 x 10 x USDINR) x (1 + duty) + clearing`}</Formula>
              <p>
                COMEX quotes dollars per troy ounce. The divisor 31.1034768 is the exact grams in a troy
                ounce, which converts the quote to dollars per gram. Multiplying by ten gives the ten gram
                basis used throughout this product. The spot rate converts to rupees. Duty compounds on
                the landed value. The clearing fee is additive, since port handling and vault charges do
                not scale with the metal price.
              </p>
            </>
          ),
        },
        {
          n: '02',
          title: 'Duty and fee constants',
          body: (
            <>
              <p>
                Import duty is applied at seven percent, composed of six percent basic customs duty and
                one percent agriculture infrastructure and development cess. The clearing constant is set
                at one hundred and thirty five rupees per ten grams, covering port handling, assaying and
                vault storage.
              </p>
              <p>
                Both are configurable on the Scenario view. Duty in particular is a policy variable and has
                moved materially within the last three budget cycles, so any result that is sensitive to a
                one percent duty change should be treated as fragile.
              </p>
            </>
          ),
        },
        {
          n: '03',
          title: 'Normalization across contracts',
          body: (
            <>
              <p>
                The four contracts cannot be compared as quoted. GOLDM is quoted per ten grams at 995
                purity. GOLDTEN is quoted per ten grams at 999. GOLDGUINEA is quoted per eight grams and
                GOLDPETAL per one gram, both at 999. Every quote is converted to a ten gram, 999 purity
                equivalent before any comparison is made.
              </p>
              <Formula>{`GOLDM       x (999 / 995)
GOLDTEN     unchanged
GOLDGUINEA  / 8 x 10
GOLDPETAL   x 10`}</Formula>
              <p>
                The purity adjustment on GOLDM is the one most often omitted elsewhere. Skipping it
                produces a persistent four tick bias that will read as a tradeable spread and is not one.
              </p>
            </>
          ),
        },
        {
          n: '04',
          title: 'The statutory cost stack',
          body: (
            <>
              <p>
                Indian commodity derivatives carry an asymmetric cost structure. Modelling it as a single
                round-trip percentage will overstate the surviving edge on every pair.
              </p>
              <Formula>{`MCX turnover     0.0021%   both legs
SEBI turnover    0.0001%   both legs
STT              0.0125%   SELL leg only
Stamp duty       0.0020%   BUY leg only
GST                 18%    of (MCX + SEBI)
Slippage         per contract liquidity tier`}</Formula>
              <p>
                Slippage is modelled from the contract's typical depth: 1.2 basis points on GOLDM, 3.5 on
                GOLDTEN, 6.8 on GOLDGUINEA and 14.2 on GOLDPETAL. For a two leg position the friction is
                the sum of both legs, which is why a spread that looks attractive on the smallest contracts
                frequently does not survive.
              </p>
            </>
          ),
        },
        {
          n: '05',
          title: 'Z-score construction',
          body: (
            <>
              <p>
                The pairwise spread is measured against a historical mean of 12.5 rupees per ten grams
                with a standard deviation of 28.0. That mean is not zero because delivery mechanics,
                tender windows and retail minting premiums create a genuine structural drift between
                contracts that does not converge.
              </p>
              <Formula>{`z = (spread - 12.5) / 28.0`}</Formula>
              <p>
                A z-score above 2.5 marks the golden zone. The product treats 3.5 sigma as the practical
                risk bound for position sizing.
              </p>
            </>
          ),
        },
        {
          n: '06',
          title: 'Limitations',
          body: (
            <>
              <p>
                The historical mean and standard deviation above are fixed constants, not rolling
                estimates. A regime change in delivery mechanics or retail demand would invalidate them
                without the model noticing.
              </p>
              <p>
                GOLDTEN was listed in 2025, so any statistic involving it rests on a materially shorter
                sample than the others. Treat GOLDTEN pairs with proportionally less confidence.
              </p>
              <p>
                Margin is approximated at 11.5 percent for SPAN plus exposure. Actual margin is set by the
                exchange, varies with volatility, and rises sharply inside tender windows.
              </p>
              <p>
                Most importantly, every price in this application is generated. The model is real; the data
                it is fed is not. Nothing on screen has been validated against an exchange feed.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
