import {
  getRoundedNumber,
  getSelectedAccountIndex,
  getShortenedHash,
  weiToEth
} from '../../utils/utils'
import {
  type Devnet,
  type DevnetAccount,
  getAccounts
} from '../../utils/network'
import React, { useContext, useEffect, useState } from 'react'
import { ConnectionContext } from '../../contexts/ConnectionContext'
import { Account, Provider } from 'starknet'
import { RemixClientContext } from '../../contexts/RemixClientContext'
import { MdRefresh } from 'react-icons/md'
import './devnetAccountSelector.css'

interface DevnetAccountSelectorProps {
  devnet: Devnet
}

const DevnetAccountSelector: React.FC<DevnetAccountSelectorProps> = (props) => {
  const { setAccount, provider, setProvider } = useContext(ConnectionContext)
  const remixClient = useContext(RemixClientContext)

  const [availableDevnetAccounts, setAvailableDevnetAccounts] = useState<
    DevnetAccount[]
  >([])

  const [selectedDevnetAccount, setSelectedDevnetAccount] =
    useState<DevnetAccount | null>(null)

  const [isDevnetAlive, setIsDevnetAlive] = useState<boolean>(false)

  // devnet live status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${props.devnet.url}/is_alive`, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const status = await response.text()

        if (status !== 'Alive!!!' || response.status !== 200) {
          if (isDevnetAlive) setIsDevnetAlive(false)
        } else {
          if (!isDevnetAlive) setIsDevnetAlive(true)
        }
      } catch (error) {
        if (isDevnetAlive) setIsDevnetAlive(false)
      }
    }, 10000)
    return () => {
      clearInterval(interval)
    }
  })

  useEffect(() => {
    setTimeout(async () => {
      if (!isDevnetAlive) {
        try {
          remixClient.cancel('notification' as any, 'toast')
          await remixClient.call(
            'notification' as any,
            'toast',
            `❗️ Server ${props.devnet.name} - ${props.devnet.url} is not healthy or not reachable at the moment`
          )
        } catch (e) {
          console.log('Failed to post message')
          console.log(e)
        }
      }
    }, 11000)
  }, [props.devnet, isDevnetAlive, remixClient])

  useEffect(() => {
    setTimeout(async () => {
      if (!isDevnetAlive) {
        return
      }
      const accounts = await getAccounts(props.devnet.url)
      setAvailableDevnetAccounts(accounts)
    }, 500)
  }, [props.devnet, isDevnetAlive])

  useEffect(() => {
    if (availableDevnetAccounts.length > 0) {
      setSelectedDevnetAccount(availableDevnetAccounts[0])
    }
  }, [availableDevnetAccounts])

  useEffect(() => {
    setProvider(
      new Provider({
        sequencer: {
          baseUrl: props.devnet.url
        }
      })
    )
    if (provider != null && selectedDevnetAccount != null) {
      setAccount(
        new Account(
          provider,
          selectedDevnetAccount.address,
          selectedDevnetAccount.private_key
        )
      )
    }
  }, [props.devnet, selectedDevnetAccount])

  function handleAccountChange(event: any) {
    if (event.target.value === -1) {
      return
    }
    setSelectedDevnetAccount(availableDevnetAccounts[event.target.value - 1])
    const newProvider = new Provider({
      sequencer: {
        baseUrl: props.devnet.url
      }
    })
    if (provider == null) setProvider(newProvider)
    setAccount(
      new Account(
        provider ?? newProvider,
        availableDevnetAccounts[event.target.value - 1].address,
        availableDevnetAccounts[event.target.value - 1].private_key
      )
    )
  }

  function getDefaultValue() {
    const index = getSelectedAccountIndex(
      availableDevnetAccounts,
      selectedDevnetAccount
    )
    if (
      index === -1 ||
      index === undefined ||
      index === null ||
      selectedDevnetAccount === null
    ) {
      return 0
    }
    return index + 1
  }

  const [accountRefreshing, setAccountRefreshing] = useState(true)

  return (
    <>
      <label className="">Devnet account selection</label>
      <div className="devnet-account-selector-wrapper">
        <select
          className="custom-select"
          aria-label=".form-select-sm example"
          onChange={handleAccountChange}
          defaultValue={getDefaultValue()}
        >
          {isDevnetAlive && availableDevnetAccounts.length > 0
            ? availableDevnetAccounts.map((account, index) => {
                return (
                  <option value={index} key={index}>
                    {`${getShortenedHash(
                      account.address || '',
                      6,
                      4
                    )} (${getRoundedNumber(
                      weiToEth(account.initial_balance),
                      2
                    )} ether)`}
                  </option>
                )
              })
            : ([
                <option value={-1} key={-1}>
                  No accounts found
                </option>
              ] as JSX.Element[])}
        </select>
        <button
          className="refresh"
          onClick={() => {
            setAccountRefreshing(true)
            // ONLY DEBUG CODE REMOVE WHILE USING
            setTimeout(() => {
              setAccountRefreshing(false)
            }, 3000)
          }}
          data-loading={accountRefreshing ? 'loading' : 'loaded'}
        >
          <MdRefresh />
        </button>
      </div>
    </>
  )
}

export default DevnetAccountSelector
