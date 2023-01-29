const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25") // um dos parâmetros do constructor do contracto desta Mock, cada request custa 0.25 LINK ETH
const GAS_PRICE_LINK = 1e9 // (link per gas), calculated value based on the gas price of the chain, so this value changes baed on the price of the token, of gas

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        // se for local preciso de mock vrfcoordinator
        log("Local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        log("Mocks deployed!")
        log("----------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
