import {MaxUint256, WeiPerEther} from "ethers";
import {Token} from "../typechain-types";
import {ethers} from "hardhat";
import {UniswapV2Deployer} from "../dist";

// 部署 UniswapV2
// 部署 Token0 和 Token1
// 加流 UniswapV2: WETH-Token0 和 WETH-Token1
// TODO 测税
async function main() {
    console.log("main")
    const [deployer] = await ethers.getSigners();
    console.log(1)
    const uniswap0 = await UniswapV2Deployer.deploy(deployer)
    const uniswap1 = await UniswapV2Deployer.deploy(deployer, <string>uniswap0.weth9.target)
    console.log(2)

    const token0 = await ethers.deployContract("Token", ["Token0", "T0", 9850]);
    const token1 = await ethers.deployContract("Token", ["Token1", "T1", 9780]);
    await token0.waitForDeployment()
    await token1.waitForDeployment()
    console.log(3)

    await (await token0.mint(deployer.address, 1001n * WeiPerEther)).wait()
    await (await token1.mint(deployer.address, 1001n * WeiPerEther)).wait()

    await (await token0.approve(uniswap0.router.target, MaxUint256)).wait();
    await (await token0.approve(uniswap1.router.target, MaxUint256)).wait();
    await (await token1.approve(uniswap0.router.target, MaxUint256)).wait();
    await (await token1.approve(uniswap1.router.target, MaxUint256)).wait();

    const addLiquidityETH = async (token: Token, uniswap: typeof uniswap0, tokenAmount: bigint, ethAMount: bigint) => {
        await (await uniswap.router.addLiquidityETH(
            token.target,
            tokenAmount * WeiPerEther,
            0,
            0,
            deployer.address,
            MaxUint256,
            {
                gasLimit: 3_000_000n,
                // gasPrice: 5_000_000_000n,
                value: ethAMount * WeiPerEther
            }
        )).wait();
    }
    await addLiquidityETH(token0, uniswap0, 200n, 10n)
    await addLiquidityETH(token0, uniswap1, 800n, 10n)
    await addLiquidityETH(token1, uniswap0, 400n, 10n)
    await addLiquidityETH(token1, uniswap1, 600n, 10n)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
