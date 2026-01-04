import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownFundLink,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';

// Reusing the styled wrapper from SparkleButton via export or redefining it here.
// To keep it simple and clean, I'll allow SparkleButton to just export the wrapper style logic if I could, but here I will redefine the styled component
// or import the SparkleButton and use it as a container.
//
// Actually, OnchainKit's <ConnectWallet> renders a <button>.
// By wrapping it in the StyledWrapper div and giving it className "sparkle-button", we apply the styles to it.
import styled from 'styled-components';

export function WalletComponent() {
  return (
    <div className="flex justify-end">
      <Wallet>
        <StyledWrapper>
          <div className="sp">
            <ConnectWallet className='sparkle-button'>
              <span className="spark" />
              <span className="backdrop" />
              <span className="text pointer-events-none">
                <Name className='text-white inline-block' />
              </span>
            </ConnectWallet>

          </div>
        </StyledWrapper>
        <WalletDropdown>
          <Identity
            className="px-4 pt-3 pb-2 hover:bg-blue-200"
            hasCopyAddressOnClick
          >
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdownBasename />
          <WalletDropdownLink
            className='hover:bg-blue-200'
            icon="wallet"
            href="https://keys.coinbase.com"
          >
            Wallet
          </WalletDropdownLink>
          <WalletDropdownFundLink />
          <WalletDropdownDisconnect className='hover:bg-blue-200' />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}

const StyledWrapper = styled.div`
  .sparkle-button {
    --active: 0;
    --bg: radial-gradient(
  			40% 50% at center 100%,
  			hsl(270 calc(var(--active) * 97%) 72% / var(--active)),
  			transparent
  		),
  		radial-gradient(
  			80% 100% at center 120%,
  			hsl(260 calc(var(--active) * 97%) 70% / var(--active)),
  			transparent
  		),
  		hsl(260 calc(var(--active) * 97%) calc((var(--active) * 44%) + 12%));
    background: var(--bg);
    font-size: 0.9rem; /* Reduced from 1.2rem */
    font-weight: 500;
    border: 0;
    cursor: pointer;
    padding: 0.4em 0.8em; /* Reduced from 0.8em 1em */
    display: flex;
    align-items: center;
    gap: 0.25em;
    white-space: nowrap;
    border-radius: 100px;
    position: relative;
    box-shadow: 0 0 calc(var(--active) * 1.5em) calc(var(--active) * 0.5em) hsl(260 97% 61% / 0.75),
  		0 0em 0 0 hsl(260 calc(var(--active) * 97%) calc((var(--active) * 50%) + 30%)) inset,
  		0 -0.05em 0 0 hsl(260 calc(var(--active) * 97%) calc(var(--active) * 60%)) inset; /* Reduced shadow spread */
    transition: box-shadow var(--transition), scale var(--transition), background var(--transition);
    scale: calc(1 + (var(--active) * 0.05)); /* Reduced scale effect */
    transition: .3s;
  }

  .sparkle-button:active {
    scale: 1;
    transition: .3s;
  }

  .sparkle path {
    color: hsl(0 0% calc((var(--active, 0) * 70%) + var(--base)));
    transform-box: fill-box;
    transform-origin: center;
    fill: currentColor;
    stroke: currentColor;
    animation-delay: calc((var(--transition) * 1.5) + (var(--delay) * 1s));
    animation-duration: 0.6s;
    transition: color var(--transition);
  }

  .sparkle-button:is(:hover, :focus-visible) path {
    animation-name: bounce;
  }

  @keyframes bounce {
    35%, 65% {
      scale: var(--scale);
    }
  }

  .sparkle path:nth-of-type(1) {
    --scale: 0.5;
    --delay: 0.1;
    --base: 40%;
  }

  .sparkle path:nth-of-type(2) {
    --scale: 1.5;
    --delay: 0.2;
    --base: 20%;
  }

  .sparkle path:nth-of-type(3) {
    --scale: 2.5;
    --delay: 0.35;
    --base: 30%;
  }

  .sparkle-button:before {
    content: "";
    position: absolute;
    inset: -0.1em; /* Reduced border offset */
    z-index: -1;
    border: 0.15em solid hsl(260 97% 50% / 0.5); /* Thinner border */
    border-radius: 100px;
    opacity: var(--active, 0);
    transition: opacity var(--transition);
  }

  .spark {
    position: absolute;
    inset: 0;
    border-radius: 100px;
    rotate: 0deg;
    overflow: hidden;
    mask: linear-gradient(white, transparent 50%);
    animation: flip calc(var(--spark) * 2) infinite steps(2, end);
  }

  @keyframes flip {
    to {
      rotate: 360deg;
    }
  }

  .spark:before {
    content: "";
    position: absolute;
    width: 200%;
    aspect-ratio: 1;
    top: 0%;
    left: 50%;
    z-index: -1;
    translate: -50% -15%;
    rotate: 0;
    transform: rotate(-90deg);
    opacity: calc((var(--active)) + 0.4);
    background: conic-gradient(
  		from 0deg,
  		transparent 0 340deg,
  		white 360deg
  	);
    transition: opacity var(--transition);
    animation: rotate var(--spark) linear infinite both;
  }

  .spark:after {
    content: "";
    position: absolute;
    inset: var(--cut);
    border-radius: 100px;
  }

  .backdrop {
    position: absolute;
    inset: var(--cut);
    background: var(--bg);
    border-radius: 100px;
    transition: background var(--transition);
  }

  @keyframes rotate {
    to {
      transform: rotate(90deg);
    }
  }

  @supports(selector(:has(:is(+ *)))) {
    body:has(button:is(:hover, :focus-visible)) {
      --active: 1;
      --play-state: running;
    }
  }

  .sparkle-button:is(:hover, :focus-visible) {
    --active: 1;
    --play-state: running;
  }

  .sp {
    position: relative;
  }

  .text {
    translate: 2% -6%;
    letter-spacing: 0.01ch;
    background: linear-gradient(90deg, hsl(0 0% calc((var(--active) * 100%) + 65%)), hsl(0 0% calc((var(--active) * 100%) + 26%)));
    -webkit-background-clip: text;
    color: transparent;
    transition: background var(--transition);
  }

  .sparkle-button svg {
    inline-size: 1.25em;
    translate: -25% -5%;
  }
`;
