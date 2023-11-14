import {MaxUint256, parseEther} from "ethers";
import {ethers} from "hardhat";
import {Token} from "../typechain-types";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {
    UniswapV2Deployer,
    IUniswapV2Pair__factory,
    IUniswapV2Factory,
    IUniswapV2Router02
} from "../dist/";
import {expect} from "chai";

describe("UniswapV2", () => {
    let feeAfter0 = 9850n;
    let feeAfter1 = 9930n;
    let amount0 = parseEther("10");
    let amount1 = parseEther("10");
    let swapAmount0 = parseEther("1")

    let deployer: HardhatEthersSigner;
    let token0: Token;
    let token1: Token;
    let factory: IUniswapV2Factory;
    let router: IUniswapV2Router02;

    beforeEach(async () => {
        [deployer] = await ethers.getSigners();
        ({factory, router} = await UniswapV2Deployer.deploy(deployer));


        const erc20Factory = await ethers.getContractFactory("Token", deployer);

        token0 = await erc20Factory.deploy("Token0", "T0", feeAfter0);
        token1 = await erc20Factory.deploy("Token1", "T1", feeAfter1);
        await token0.waitForDeployment()
        await token1.waitForDeployment()

        await (
            await token0.mint(deployer.address, amount0 + swapAmount0)
        ).wait()
        await (
            await token1.mint(deployer.address, amount1)
        ).wait()
    });

    it("swap", async () => {
        await (
            await token0.approve(router.target, MaxUint256)
        ).wait();
        await (
            await token1.approve(router.target, MaxUint256)
        ).wait();

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

        const pair = IUniswapV2Pair__factory.connect(
            await factory.getPair(token0.target, token1.target),
            deployer
        );

        console.log("\t\tpair balance:", await pair.balanceOf(deployer.address))
        expect(await pair.balanceOf(deployer.address)).equal(
            sqrt(amount0 * feeAfter0 / 10000n * amount1 * feeAfter1 / 10000n) - 1000n
        );
        await (
            await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                swapAmount0,
                0,
                [token0.target, token1.target],
                deployer.address,
                MaxUint256
            )
        ).wait();
        console.log("\t\tswap result:", await token0.balanceOf(deployer.address), await token1.balanceOf(deployer.address))
    });
});


function sqrt(b: bigint) {
    if (b < 0n) {
        throw new Error("Cannot calculate square root of a negative number");
    }

    let x = b;

    while (true) {
        const y = (x + b / x) >> 1n;
        if (y >= x) {
            return x;
        }
        x = y;
    }
}
