# uniswap-v2-deployer

> forked from `https://github.com/AlexBHarley/uniswap-v2-deploy-plugin`

One-Click Deployment Tool for Uniswap V2, TypeScript version, dependent on `ethers 6.*`. Usage as follows:

- install:

```cmd
npm i --save-dev uniswap-v2-deployer
```

- quick start:

```typescript
const {factory, router, weth9} = await UniswapV2Deployer.deploy(deployer);

const pair = IUniswapV2Pair__factory.connect(
    await factory.getPair(token0.target, token1.target),
    deployer
);
```

- example:

```typescript
// router addLiquidity (don't forget token-approve-router first)
await (
    await router.addLiquidity(
        token0.target,
        token1.target,
        amount0,
        amount1,
        0,
        0,
        deployer.address,
        MaxUint256
    )
).wait();

// router swap
await (
    await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        swapAmount0,
        0,
        [token0.target, token1.target],
        deployer.address,
        MaxUint256
    )
).wait();
```
