"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import { encodeFunctionData } from 'viem';
import { useAccount } from 'wagmi';
import { createStore } from 'mipd@0.0.7';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { config } from "~/components/providers/WagmiProvider";
import { PurpleButton } from "~/components/ui/PurpleButton";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { USDC_CONTRACT, RECIPIENT } from '~/lib/constants';
import { parseUnits } from 'viem';
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd@0.0.7";
import { Label } from "~/components/ui/label";
import { PROJECT_TITLE } from "~/lib/constants";

function SendUSDC() {
  const { isConnected } = useAccount();
  const { data: hash, sendTransaction, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
  });

  const handleSend = () => {
    sendTransaction({
      to: RECIPIENT,
      value: parseUnits('0', 6), // 0 ETH value
      data: encodeFunctionData({
        abi: [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'value', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }]
          }
        ],
        functionName: 'transfer',
        args: [RECIPIENT, parseUnits('1', 6)] // 1 USDC
      })
    });
  };

  return (
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-900">Send 1 USDC</CardTitle>
        <CardDescription className="text-neutral-600">
          Send 1 USDC to hellno.eth on Base
        </CardDescription>
      </CardHeader>
      <CardContent className="text-neutral-800">
        <PurpleButton 
          onClick={handleSend}
          disabled={!isConnected || isPending}
        >
          {isPending ? 'Sending...' : 'Send 1 USDC'}
        </PurpleButton>
        
        {hash && <div className="mt-2 text-sm">Transaction Hash: {truncateAddress(hash)}</div>}
        {isConfirming && <div className="mt-2 text-sm">Confirming...</div>}
        {isConfirmed && <div className="mt-2 text-sm">Transaction confirmed!</div>}
      </CardContent>
    </Card>
  );
}

export default function Frame(
  { title }: { title?: string } = { title: PROJECT_TITLE }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  const [added, setAdded] = useState(false);

  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) {
        return;
      }

      setContext(context);
      setAdded(context.client.added);

      // If frame isn't already added, prompt user to add it
      if (!context.client.added) {
        addFrame();
      }

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setAdded(true);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        console.log("frameAddRejected", reason);
      });

      sdk.on("frameRemoved", () => {
        console.log("frameRemoved");
        setAdded(false);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        console.log("notificationsEnabled", notificationDetails);
      });
      sdk.on("notificationsDisabled", () => {
        console.log("notificationsDisabled");
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      console.log("Calling ready");
      sdk.actions.ready({});

      // Set up a MIPD Store, and request Providers.
      const store = createStore();

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
        // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
      });
    };
    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, addFrame]);

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        <span className="ml-4 text-purple-600 text-xl">Loading Onsen Magic...</span>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4 text-neutral-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
          {title}
        </h1>
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 animate-pulse"></div>
          <div className="relative bg-white rounded-lg p-4">
            <SendUSDC />
          </div>
        </div>
        <div className="mt-4 text-center text-neutral-600">
          <span className="animate-bounce">♨️</span> Powered by Onsen ♨️
        </div>
      </div>
    </div>
  );
}
