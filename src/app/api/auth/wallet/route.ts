import { NextRequest, NextResponse } from 'next/server';
import { createWalletToken } from '@/shared/utils/wallet-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({
        error: 'Wallet address required',
        message: 'Please provide a wallet address'
      }, { status: 400 });
    }

    // TODO: Add signature verification in the future
    // For now, we'll trust the wallet address
    // In production, you should verify the signature

    // Create JWT token
    const token = await createWalletToken(walletAddress);

    // Create user object (no database needed)
    const user = {
      id: walletAddress.toLowerCase(),
      wallet_address: walletAddress.toLowerCase(),
      display_name: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
    };

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        wallet_address: user.wallet_address,
        display_name: user.display_name
      },
      message: 'Wallet authenticated successfully'
    });

  } catch (error) {
    console.error('Wallet authentication error:', error);
    return NextResponse.json({
      error: 'Authentication failed',
      message: 'Please try again'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
