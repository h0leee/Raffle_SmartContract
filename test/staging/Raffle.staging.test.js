const { developmentChains, networkConfig } = require("../../helper-hardhat-config") //  certificarmo-nos de que os unit tests acontecem só em developmentchains, local networks
const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")

// em staging tests, como não são testes locais, temos de ver primeiro em que tipo de network estamos

developmentChains.includes(network.name)
    ? describe.skip // se developmentchains não incluir aquilo, describe.skip senão faço o describe
    : describe("Raffle Unit Tests", function () {
          let raffle, raffleContract, raffleEntranceFee, player

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntrancefee()
          })
          describe("fulfillRandomWords", function () {
              it("works with live chainlink keepers and chainlink vrf, we get a random winner", async function () {
                  // enter the raffle
                  console.log("Setting up test...")
                  const startingTimeStamp = await raffle.getLastTimeStamp()
                  const accounts = await ethers.getSigners() // só vai haver um, só usamos o deployer

                  console.log("Setting up listener...")
                  await new Promise(async (resolve, reject) => {
                      //setup listeneer before we enter the raffle
                      //just in case the blockchain moves really fast
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          try {
                              // asserts here
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLastTimeStamp()

                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                          }
                      })
                      // Entering the raffle
                      console.log("Entering the raffle...")
                      const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                      await tx.wait(1)
                      console.log("Ok, time to wait...")
                      const winnerStartingBalance = await accounts[0].getBalance()

                      // And this code wont complete until our listener is done listening
                  })
              })
          })
      })
