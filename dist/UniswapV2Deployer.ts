import {Signer, ContractFactory, ZeroAddress} from "ethers";
import {IUniswapV2Factory, IUniswapV2Router02, IWETH, IWETH__factory} from "./index";
import UniswapV2FactoryJson from "./abi/UniswapV2Factory.json"
import UniswapV2PairJson from "./abi/UniswapV2Pair.json"
import UniswapV2Router02Json from "./abi/UniswapV2Router02.json"
import WETH9Json from "./abi/WETH9.json";

const artifacts: { [name: string]: { abi: any; bytecode: string } } = {
    UniswapV2Factory: UniswapV2FactoryJson,
    UniswapV2Pair: UniswapV2PairJson,
    UniswapV2Router02: UniswapV2Router02Json,
    WETH9: WETH9Json,
};

export const SwapFee = 0.003;

export type UniswapV2 = {
    router: IUniswapV2Router02;
    factory: IUniswapV2Factory;
    weth9: IWETH;
}

export class UniswapV2Deployer {
    signer: Signer;

    constructor(signer: Signer) {
        this.signer = signer;
    }

    async deployFactory() {
        return (await this.deployContract<IUniswapV2Factory>(
            artifacts.UniswapV2Factory.abi,
            artifacts.UniswapV2Factory.bytecode,
            [ZeroAddress],
            this.signer
        )) as IUniswapV2Factory;
    }

    async deployWETH9() {
        return await this.deployContract<IWETH>(
            artifacts.WETH9.abi,
            artifacts.WETH9.bytecode,
            [],
            this.signer
        );
    }

    async deployRouter(factoryAddress: string, weth9Address: string) {
        return (await this.deployContract<IUniswapV2Router02>(
            artifacts.UniswapV2Router02.abi,
            artifacts.UniswapV2Router02.bytecode,
            [factoryAddress, weth9Address],
            this.signer
        )) as IUniswapV2Router02;
    }

    static async deploy(signer: Signer, weth?: string): Promise<UniswapV2> {
        const deployer = new UniswapV2Deployer(signer);

        let weth9: IWETH;
        if (weth) {
            weth9 = IWETH__factory.connect(weth, signer)
        } else {
            weth9 = await deployer.deployWETH9();
        }
        const factory = await deployer.deployFactory();
        const router = await deployer.deployRouter(await factory.getAddress(), await weth9.getAddress());
        const uniswap = await Promise.all([
            weth9.waitForDeployment(),
            factory.waitForDeployment(),
            router.waitForDeployment(),
        ]);
        return {weth9: uniswap[0], factory: uniswap[1], router: uniswap[2]};
    }

    private async deployContract<T>(
        abi: any,
        bytecode: string,
        deployParams: Array<any>,
        _signer: Signer
    ) {
        const factory = new ContractFactory(abi, bytecode, _signer);
        return await factory.deploy(...deployParams) as T;
    }
}
