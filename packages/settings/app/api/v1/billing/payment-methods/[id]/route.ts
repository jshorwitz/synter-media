import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    await prisma.paymentMethod.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isDefault } = await request.json();

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other default methods
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { 
          userId: user.id,
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false }
      });
    }

    const updatedMethod = await prisma.paymentMethod.update({
      where: { id: params.id },
      data: { isDefault }
    });

    // Remove sensitive data
    const sanitizedMethod = {
      ...updatedMethod,
      stripePaymentMethodId: undefined,
      last4: updatedMethod.cardLast4,
      cardLast4: undefined
    };

    return NextResponse.json(sanitizedMethod);
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
