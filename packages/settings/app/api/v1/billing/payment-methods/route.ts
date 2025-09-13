import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Remove sensitive data before sending to client
    const sanitizedMethods = paymentMethods.map(method => ({
      ...method,
      stripePaymentMethodId: undefined, // Don't send to client
      last4: method.cardLast4,
      cardLast4: undefined
    }));

    return NextResponse.json({ paymentMethods: sanitizedMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      stripePaymentMethodId, 
      type, 
      cardBrand, 
      cardLast4, 
      cardExpMonth, 
      cardExpYear,
      isDefault 
    } = await request.json();

    if (!stripePaymentMethodId || !type) {
      return NextResponse.json(
        { error: 'Stripe payment method ID and type are required' },
        { status: 400 }
      );
    }

    // If setting as default, unset other default methods
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { 
          userId: user.id,
          isDefault: true 
        },
        data: { isDefault: false }
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        stripePaymentMethodId,
        type,
        cardBrand,
        cardLast4,
        cardExpMonth,
        cardExpYear,
        isDefault: isDefault || false
      }
    });

    // Remove sensitive data before sending response
    const sanitizedMethod = {
      ...paymentMethod,
      stripePaymentMethodId: undefined,
      last4: paymentMethod.cardLast4,
      cardLast4: undefined
    };

    return NextResponse.json(sanitizedMethod, { status: 201 });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
