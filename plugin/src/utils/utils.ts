import { type DevnetAccount } from '../types/accounts'
import { type AbiElement, type Abi, type Contract } from '../types/contracts'
import { type Network, networkExplorerUrls } from './constants'

function isValidCairo (filename: string): boolean {
  return filename.endsWith('.cairo')
}

const getFileExtension = (filename: string): string =>
  filename.split('.').pop() ?? ''

const getFileNameFromPath = (path: string): string =>
  path.split('/').pop() ?? ''

const getContractNameFromFullName = (fullName: string): string =>
  fullName.split('.')[0]

const artifactFolder = (path: string): string => {
  if (path.includes('artifacts')) return path.split('/').slice(0, -1).join('/')
  return path.split('/').slice(0, -1).join('/').concat('/artifacts')
}

const artifactFilename = (ext: '.json' | '.casm', filename: string): string =>
  filename.split('.')[0].concat(ext)

const getContractByClassHash = (
  classHash: string,
  contracts: Contract[]
): Contract | undefined => {
  return contracts.find((contract) => contract.classHash === classHash)
}

const getShortenedHash = (
  address: string,
  first: number,
  second: number
): string => {
  return `${address.slice(0, first)}...${address.slice(-1 * second)}`
}

const getConstructor = (abi: Abi): AbiElement | undefined => {
  return abi.find((item) => item.name === 'constructor')
}

const getContractFunctions = (abi: Abi): AbiElement[] => {
  const contractFunctions = abi.filter(
    (item) => item.type === 'function' && item.name !== 'constructor'
  )
  return contractFunctions
}

const getReadFunctions = (abi: Abi): AbiElement[] => {
  const readFunctions = abi.filter(
    (item) =>
      item.type === 'function' &&
      item.name !== 'constructor' &&
      item.state_mutability === 'view'
  )
  return readFunctions
}

const getWriteFunctions = (abi: Abi): AbiElement[] => {
  const writeFunctions = abi.filter(
    (item) =>
      item.type === 'function' &&
      item.name !== 'constructor' &&
      item.state_mutability === 'external'
  )
  return writeFunctions
}

const getParameterType = (parameter: string): string | undefined => {
  return parameter.split('::').pop()
}

const getSelectedContractIndex = (
  contracts: Contract[],
  selectedContract: Contract | null
): number => {
  if (selectedContract != null) {
    return contracts.findIndex(
      (contract) => contract.classHash === selectedContract.classHash
    )
  }
  return 0
}

const getSelectedAccountIndex = (
  accounts: DevnetAccount[],
  selectedAccount: DevnetAccount | null
): number | undefined => {
  if (selectedAccount != null) {
    return accounts.findIndex(
      (account) => account.address === selectedAccount.address
    )
  }
}

const getRoundedNumber = (number: number, decimals: number): number => {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

const weiToEth = (wei: number): number => {
  return wei / 10 ** 18
}

const getExplorerUrl = (network: Network): string | undefined =>
  networkExplorerUrls[network]

export {
  isValidCairo,
  getFileExtension,
  getFileNameFromPath,
  getContractNameFromFullName,
  artifactFolder,
  artifactFilename,
  getContractByClassHash,
  getShortenedHash,
  getConstructor,
  getContractFunctions,
  getReadFunctions,
  getWriteFunctions,
  getParameterType,
  getSelectedContractIndex,
  getSelectedAccountIndex,
  getRoundedNumber,
  weiToEth,
  getExplorerUrl
}
