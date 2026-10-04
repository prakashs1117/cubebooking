/** Flat vector school building illustration — pure SVG, no raster images. */
export default function SchoolIllustration({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 1260 840"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Flat illustration of a school building with clock tower, flag, trees and a paved walkway"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    >
      <defs>
        <linearGradient id="school-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fc4ea"/>
          <stop offset="1" stopColor="#6fd8ef"/>
        </linearGradient>
        <clipPath id="school-frame"><rect width="1260" height="840"/></clipPath>
      </defs>

      <g clipPath="url(#school-frame)">
        {/* sky */}
        <rect width="1260" height="840" fill="url(#school-sky)"/>

        {/* distant hills */}
        <path d="M0 470 C 150 330 330 330 470 450 C 600 560 700 560 830 450 C 970 330 1140 340 1260 470 L1260 700 L0 700Z" fill="#b6e6f5"/>
        <path d="M0 520 C 180 420 300 430 430 510 C 560 590 720 590 860 505 C 990 425 1130 430 1260 520 L1260 700 L0 700Z" fill="#d8f2fa"/>

        {/* clouds */}
        <g fill="#ffffff">
          <path d="M70 180 a60 60 0 0 1 60-58 a78 78 0 0 1 150-14 a62 62 0 0 1 86 72Z"/>
          <path d="M780 120 a52 52 0 0 1 52-50 a68 68 0 0 1 130-12 a54 54 0 0 1 74 62Z"/>
          <path d="M980 250 a44 44 0 0 1 44-42 a58 58 0 0 1 110-10 a46 46 0 0 1 64 52Z" opacity=".92"/>
        </g>

        {/* conifers back row */}
        <g>
          <g fill="#4e9e94">
            <path d="M110 250 l72 150 h-144Z"/><path d="M110 330 l88 170 h-176Z"/>
            <path d="M212 300 l62 130 h-124Z"/><path d="M212 370 l76 150 h-152Z"/>
            <path d="M1150 250 l72 150 h-144Z"/><path d="M1150 330 l88 170 h-176Z"/>
            <path d="M1050 300 l62 130 h-124Z"/><path d="M1050 370 l76 150 h-152Z"/>
          </g>
          <g fill="#3d8880">
            <path d="M110 250 l72 150 h-72Z"/><path d="M110 330 l88 170 h-88Z"/>
            <path d="M212 300 l62 130 h-62Z"/><path d="M212 370 l76 150 h-76Z"/>
            <path d="M1150 250 l72 150 h-72Z"/><path d="M1150 330 l88 170 h-88Z"/>
            <path d="M1050 300 l62 130 h-62Z"/><path d="M1050 370 l76 150 h-76Z"/>
          </g>
        </g>

        {/* ground */}
        <path d="M0 640 C 220 600 420 650 630 648 C 860 646 1050 598 1260 640 L1260 840 L0 840Z" fill="#8bd45a"/>
        <path d="M0 700 C 240 672 430 712 640 708 C 880 704 1060 664 1260 700 L1260 840 L0 840Z" fill="#6cc243"/>

        {/* building body */}
        <rect x="258" y="330" width="744" height="316" fill="#f6bd7a"/>
        <rect x="630" y="330" width="372" height="316" fill="#e9a862"/>
        {/* roof slab */}
        <rect x="246" y="318" width="768" height="30" fill="#d24f4a"/>
        <rect x="258" y="348" width="744" height="18" fill="#c6453f"/>
        {/* mid band */}
        <rect x="258" y="470" width="744" height="20" fill="#d24f4a"/>
        {/* base */}
        <rect x="258" y="604" width="744" height="42" fill="#d6763e"/>
        <rect x="246" y="636" width="768" height="24" fill="#3b4a6b"/>

        {/* central block */}
        <rect x="522" y="262" width="216" height="384" fill="#f8c88b"/>
        <rect x="630" y="262" width="108" height="384" fill="#edb574"/>
        <rect x="510" y="276" width="240" height="30" fill="#d24f4a"/>
        <rect x="510" y="452" width="240" height="30" fill="#d24f4a"/>

        {/* tower */}
        <rect x="566" y="150" width="128" height="120" fill="#f8c88b"/>
        <rect x="630" y="150" width="64" height="120" fill="#edb574"/>
        <path d="M630 96 L772 186 L756 200 L630 120 L504 200 L488 186Z" fill="#c6453f"/>
        <path d="M630 96 L772 186 L756 200 L630 120Z" fill="#b03b36"/>
        {/* clock */}
        <circle cx="630" cy="232" r="30" fill="#fdf6e8"/>
        <circle cx="630" cy="232" r="30" fill="none" stroke="#e0d2b6" strokeWidth="3"/>
        <path d="M630 232 V214 M630 232 H648" stroke="#4a3b2e" strokeWidth="4" strokeLinecap="round"/>
        {/* flag */}
        <rect x="636" y="30" width="5" height="70" fill="#2b3a55"/>
        <path d="M641 40 C 668 32 678 56 700 48 C 690 72 696 92 700 100 C 676 92 664 112 641 104Z" fill="#f0923a"/>

        {/* windows left wing */}
        <g fill="#3b4a6b">
          <rect x="296" y="372" width="56" height="78" rx="3"/>
          <rect x="376" y="372" width="56" height="78" rx="3"/>
          <rect x="456" y="372" width="56" height="78" rx="3"/>
          <rect x="296" y="508" width="56" height="78" rx="3"/>
          <rect x="376" y="508" width="56" height="78" rx="3"/>
          <rect x="456" y="508" width="56" height="78" rx="3"/>
        </g>
        <g fill="#8fd7ee">
          <rect x="302" y="378" width="44" height="66"/><rect x="382" y="378" width="44" height="66"/><rect x="462" y="378" width="44" height="66"/>
          <rect x="302" y="514" width="44" height="66"/><rect x="382" y="514" width="44" height="66"/><rect x="462" y="514" width="44" height="66"/>
        </g>
        <g fill="#bfeaf7">
          <path d="M302 444 L346 378 L346 400 L324 444Z"/><path d="M382 444 L426 378 L426 400 L404 444Z"/><path d="M462 444 L506 378 L506 400 L484 444Z"/>
          <path d="M302 580 L346 514 L346 536 L324 580Z"/><path d="M382 580 L426 514 L426 536 L404 580Z"/><path d="M462 580 L506 514 L506 536 L484 580Z"/>
        </g>
        <g stroke="#3b4a6b" strokeWidth="5">
          <path d="M324 378 V444 M302 411 H346"/><path d="M404 378 V444 M382 411 H426"/><path d="M484 378 V444 M462 411 H506"/>
          <path d="M324 514 V580 M302 547 H346"/><path d="M404 514 V580 M382 547 H426"/><path d="M484 514 V580 M462 547 H506"/>
        </g>

        {/* windows right wing (mirrored) */}
        <g transform="translate(1260,0) scale(-1,1)">
          <g fill="#2f3d5c">
            <rect x="296" y="372" width="56" height="78" rx="3"/><rect x="376" y="372" width="56" height="78" rx="3"/><rect x="456" y="372" width="56" height="78" rx="3"/>
            <rect x="296" y="508" width="56" height="78" rx="3"/><rect x="376" y="508" width="56" height="78" rx="3"/><rect x="456" y="508" width="56" height="78" rx="3"/>
          </g>
          <g fill="#7ccae3">
            <rect x="302" y="378" width="44" height="66"/><rect x="382" y="378" width="44" height="66"/><rect x="462" y="378" width="44" height="66"/>
            <rect x="302" y="514" width="44" height="66"/><rect x="382" y="514" width="44" height="66"/><rect x="462" y="514" width="44" height="66"/>
          </g>
          <g fill="#a9dff2">
            <path d="M302 444 L346 378 L346 400 L324 444Z"/><path d="M382 444 L426 378 L426 400 L404 444Z"/><path d="M462 444 L506 378 L506 400 L484 444Z"/>
            <path d="M302 580 L346 514 L346 536 L324 580Z"/><path d="M382 580 L426 514 L426 536 L404 580Z"/><path d="M462 580 L506 514 L506 536 L484 580Z"/>
          </g>
          <g stroke="#2f3d5c" strokeWidth="5">
            <path d="M324 378 V444 M302 411 H346"/><path d="M404 378 V444 M382 411 H426"/><path d="M484 378 V444 M462 411 H506"/>
            <path d="M324 514 V580 M302 547 H346"/><path d="M404 514 V580 M382 547 H426"/><path d="M484 514 V580 M462 547 H506"/>
          </g>
        </g>

        {/* central upper windows */}
        <g fill="#c6453f">
          <rect x="548" y="338" width="44" height="72" rx="3"/><rect x="608" y="338" width="44" height="72" rx="3"/><rect x="668" y="338" width="44" height="72" rx="3"/>
        </g>
        <g fill="#8fd7ee">
          <rect x="554" y="344" width="32" height="60"/><rect x="614" y="344" width="32" height="60"/><rect x="674" y="344" width="32" height="60"/>
        </g>
        <g fill="#bfeaf7">
          <path d="M554 404 L586 344 L586 364 L572 404Z"/><path d="M614 404 L646 344 L646 364 L632 404Z"/><path d="M674 404 L706 344 L706 364 L692 404Z"/>
        </g>
        <g stroke="#c6453f" strokeWidth="5">
          <path d="M570 344 V404 M554 374 H586"/><path d="M630 344 V404 M614 374 H646"/><path d="M690 344 V404 M674 374 H706"/>
        </g>

        {/* entrance */}
        <path d="M538 646 V560 a92 92 0 0 1 184 0 V646Z" fill="#fdf3e0"/>
        <path d="M556 646 V562 a74 74 0 0 1 148 0 V646Z" fill="#6a4426"/>
        <rect x="566" y="516" width="128" height="130" fill="#8b5a2d"/>
        <rect x="628" y="516" width="4" height="130" fill="#6a4426"/>
        <circle cx="612" cy="576" r="6" fill="#f3e4c6"/>
        <circle cx="648" cy="576" r="6" fill="#f3e4c6"/>
        {/* lamps */}
        <rect x="528" y="520" width="26" height="8" fill="#fdf3e0"/>
        <rect x="706" y="520" width="26" height="8" fill="#fdf3e0"/>

        {/* walkway */}
        <path d="M556 648 L704 648 L906 840 L354 840Z" fill="#5b6b8c"/>
        <path d="M630 648 L704 648 L906 840 L630 840Z" fill="#4e5c7c"/>
        <g fill="#e8eef6">
          <path d="M578 664 L682 664 L688 686 L572 686Z"/>
          <path d="M566 704 L694 704 L702 730 L558 730Z"/>
          <path d="M552 750 L708 750 L718 780 L542 780Z"/>
          <path d="M536 800 L724 800 L736 836 L524 836Z"/>
        </g>

        {/* bushes */}
        <g fill="#5bb038" opacity=".55">
          <ellipse cx="180" cy="780" rx="170" ry="34"/>
          <ellipse cx="1090" cy="776" rx="170" ry="34"/>
        </g>

        {/* left trees */}
        <g>
          <rect x="166" y="596" width="22" height="176" fill="#8b4b2f"/>
          <path d="M177 660 L140 622 M177 690 L214 650" stroke="#8b4b2f" strokeWidth="12" strokeLinecap="round"/>
          <g fill="#2f8c3d">
            <circle cx="106" cy="520" r="62"/><circle cx="180" cy="470" r="76"/><circle cx="252" cy="522" r="64"/><circle cx="178" cy="560" r="70"/>
          </g>
          <g fill="#3fa84a">
            <circle cx="180" cy="470" r="54"/><circle cx="118" cy="528" r="42"/>
          </g>
          <rect x="274" y="640" width="16" height="132" fill="#8b4b2f"/>
          <g fill="#58c148">
            <circle cx="236" cy="600" r="40"/><circle cx="286" cy="566" r="48"/><circle cx="330" cy="604" r="40"/><circle cx="284" cy="624" r="44"/>
          </g>
          <g fill="#6ed45a"><circle cx="286" cy="566" r="32"/></g>
        </g>

        {/* right trees */}
        <g>
          <rect x="1082" y="596" width="22" height="176" fill="#8b4b2f"/>
          <path d="M1093 660 L1130 622 M1093 690 L1056 650" stroke="#8b4b2f" strokeWidth="12" strokeLinecap="round"/>
          <g fill="#2f8c3d">
            <circle cx="1164" cy="520" r="62"/><circle cx="1090" cy="470" r="76"/><circle cx="1018" cy="522" r="64"/><circle cx="1092" cy="560" r="70"/>
          </g>
          <g fill="#3fa84a"><circle cx="1090" cy="470" r="54"/><circle cx="1150" cy="528" r="42"/></g>
          <rect x="982" y="640" width="16" height="132" fill="#8b4b2f"/>
          <g fill="#58c148">
            <circle cx="944" cy="600" r="40"/><circle cx="992" cy="566" r="48"/><circle cx="1038" cy="604" r="40"/><circle cx="990" cy="624" r="44"/>
          </g>
          <g fill="#6ed45a"><circle cx="992" cy="566" r="32"/></g>
        </g>

        {/* tree base soil */}
        <g fill="#7a3f27">
          <ellipse cx="177" cy="772" rx="48" ry="12"/>
          <ellipse cx="282" cy="772" rx="36" ry="10"/>
          <ellipse cx="1093" cy="772" rx="48" ry="12"/>
          <ellipse cx="990" cy="772" rx="36" ry="10"/>
        </g>
      </g>
    </svg>
  )
}
