'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, Zap, Crown, Building2,
  Loader2, AlertCircle, CreditCard,
  Gift, Clock, XCircle, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window { Razorpay: any; }
}

// ── Plan Config ───────────────────────────────────
const PLAN_CONFIG: Record<string, any> = {
  Free: {
    icon: Zap,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    badge: 'bg-slate-100 text-slate-600',
    features: [
      '50 API calls/day',
      '15 conversations/day',
      '50 visitors/day',
      '10MB knowledge base',
      '5 messages/conversation',
      'Fluxypy branding',
    ],
  },
  Starter: {
    icon: Zap,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    features: [
      '400 API calls/day',
      '70 conversations/day',
      '200 visitors/day',
      '100MB knowledge base',
      '20 messages/conversation',
      'Email support',
    ],
  },
  Pro: {
    icon: Crown,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    badge: 'bg-indigo-100 text-indigo-700',
    popular: true,
    features: [
      '3,500 API calls/day',
      '500 conversations/day',
      '900 visitors/day',
      '500MB knowledge base',
      '50 messages/conversation',
      'Custom domain ✅',
      'Priority support ✅',
    ],
  },
  Business: {
    icon: Building2,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
    features: [
      '10,000 API calls/day',
      '2,500 conversations/day',
      '3,500 visitors/day',
      '2GB knowledge base',
      '100 messages/conversation',
      'Custom domain ✅',
      'Remove branding ✅',
      'Priority support ✅',
      'Dedicated manager ✅',
    ],
  },
};

// ── Status Badge ──────────────────────────────────
function StatusBanner({ subscription }: { subscription: any }) {
  if (!subscription) return null;

  const { status, plan, trialEndDate, daysLeftInTrial, currentPeriodEnd } = subscription;

  if (status === 'none') {
    return (
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Free Plan</p>
            <p className="text-sm text-slate-500 mt-0.5">
              50 API calls/day · Upgrade for more
            </p>
          </div>
          <Badge className="ml-auto bg-slate-200 text-slate-600 border-0">Free</Badge>
        </CardContent>
      </Card>
    );
  }

  if (status === 'trial') {
    return (
      <Card className="border-yellow-300 bg-yellow-50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Gift className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">🎁 Free Trial Active</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Expires: {new Date(trialEndDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })} · {daysLeftInTrial} days left
            </p>
          </div>
          {daysLeftInTrial <= 5 && (
            <Badge className="ml-auto bg-red-100 text-red-600 border-0 animate-pulse">
              Expiring Soon!
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  if (status === 'active') {
    return (
      <Card className="border-green-300 bg-green-50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              ✅ {plan?.name} Plan Active
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              {subscription.paymentType === 'subscription'
                ? `Auto-renews: ${currentPeriodEnd
                    ? new Date(currentPeriodEnd).toLocaleDateString('en-IN')
                    : 'N/A'}`
                : 'One-time payment · No auto-renewal'}
            </p>
          </div>
          <Badge className="ml-auto bg-green-100 text-green-700 border-0">
            Active
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (status === 'expired') {
    return (
      <Card className="border-red-300 bg-red-50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Trial Expired</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Subscribe to continue using all features
            </p>
          </div>
          <Badge className="ml-auto bg-red-100 text-red-600 border-0">Expired</Badge>
        </CardContent>
      </Card>
    );
  }

  if (status === 'cancelled') {
    return (
      <Card className="border-orange-300 bg-orange-50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Subscription Cancelled</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Access until: {currentPeriodEnd
                ? new Date(currentPeriodEnd).toLocaleDateString('en-IN')
                : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// ── Trial Request Section ─────────────────────────
function TrialSection({ subscription, onTrialRequested }: any) {
  const [loading, setLoading] = useState(false);

  // ── Check if already requested ─────────────────
  const { data: trialStatus, refetch: refetchTrialStatus } = useQuery({
    queryKey: ['trial-status'],
    queryFn: async () => {
      const res = await api.get('/billing/trial/status');
      return res.data;
    },
  });

  const canRequestTrial =
    !['trial', 'active'].includes(subscription?.status) &&
    subscription?.status !== 'cancelled';

  if (!canRequestTrial) return null;

  // Already pending
  if (trialStatus?.status === 'pending') {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              ⏳ Trial Request Pending
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              Your request is under review. Admin will approve within 24 hours.
            </p>
          </div>
          <Badge className="ml-auto bg-yellow-100 text-yellow-700 border-0 animate-pulse">
            Under Review
          </Badge>
        </CardContent>
      </Card>
    );
  }

  // Already rejected
  if (trialStatus?.status === 'rejected') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Trial Request Rejected</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {trialStatus.rejectReason || 'Contact support for more information.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleRequestTrial = async () => {
    setLoading(true);
    try {
      const res = await api.post('/billing/trial/verify-order');
      if (!res.data.canProceed) {
        toast.error('Not eligible for trial');
        return;
      }
      await api.post('/billing/trial/submit', { verified: true });
      toast.success('🎉 Trial request submitted! Admin will review within 24 hours.');
      refetchTrialStatus();
      onTrialRequested();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">
                Try Free for 30 Days! 🎁
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                No credit card · Admin approves within 24 hrs
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {['100 API calls/day', '30MB KB', '50 conversations/day'].map((f) => (
                  <span key={f} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    ✅ {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Button
            onClick={handleRequestTrial}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
            ) : (
              <><Gift className="w-4 h-4 mr-2" />Request Free Trial</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Billing Page ─────────────────────────────
export default function BillingPage() {
  const queryClient = useQueryClient();
  const [paymentType, setPaymentType] = useState<'subscription' | 'one_time'>('subscription');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const { data: subscription, refetch: refetchSub } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await api.get('/billing/subscription');
      return res.data;
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await api.get('/billing/plans');
      return res.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post('/billing/cancel'),
    onSuccess: () => {
      toast.success('Subscription cancelled successfully');
      refetchSub();
    },
    onError: () => toast.error('Failed to cancel subscription'),
  });

  const handlePayment = async (planName: string, priceMonthly: number) => {
    setLoadingPlan(planName);
    try {
      const endpoint = paymentType === 'subscription'
        ? '/billing/subscription-order'
        : '/billing/one-time-order';

      const res = await api.post(endpoint, { planName });
      const orderData = res.data;

      const options: any = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Fluxypy Bot',
        description: `${planName} Plan — ${paymentType === 'subscription' ? 'Monthly' : 'One-time'}`,
        prefill: {
          name: orderData.orgName,
          email: orderData.email,
        },
        theme: { color: '#6366F1' },
        handler: async (response: any) => {
          try {
            await api.post('/billing/verify', {
              ...response,
              planName,
              paymentType,
            });
            toast.success(`🎉 ${planName} plan activated!`);
            refetchSub();
            queryClient.invalidateQueries({ queryKey: ['usage'] });
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
            toast.error('Payment cancelled');
          },
        },
      };

      if (paymentType === 'subscription') {
        options.subscription_id = orderData.subscriptionId;
      } else {
        options.order_id = orderData.orderId;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoadingPlan(null);
    }
  };

  const activePlanName = subscription?.plan?.name;
  const isActive = subscription?.status === 'active';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-500 mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Status */}
      <StatusBanner subscription={subscription} />

      {/* Trial Request Section */}
      <TrialSection
        subscription={subscription}
        onTrialRequested={refetchSub}
      />

      {/* Payment Type Toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-slate-600">Payment Type:</span>
        <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
          {([
            { key: 'subscription', label: '🔄 Monthly Subscription' },
            { key: 'one_time', label: '💳 One-time Payment' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPaymentType(key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                paymentType === key
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {paymentType === 'one_time' && (
          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
            ⚠️ One-time = 1 month access, no auto-renewal
          </span>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(plans || [])
          .filter((p: any) => p.name !== 'Free' && p.name !== 'Enterprise')
          .map((plan: any) => {
            const config = PLAN_CONFIG[plan.name] || {};
            const Icon = config.icon || Zap;
            const isCurrent = activePlanName === plan.name && isActive;

            return (
              <Card
                key={plan.name}
                className={`relative border-2 transition-all ${
                  isCurrent
                    ? 'border-green-400 shadow-lg'
                    : config.popular
                      ? 'border-indigo-400 shadow-md'
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                {config.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white px-3 border-0">
                      ⭐ Most Popular
                    </Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-3 border-0">
                      ✅ Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3 pt-6">
                  <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center mb-2`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-slate-900">
                      ₹{Number(plan.priceMonthly).toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {paymentType === 'subscription' ? '/month' : ' one-time'}
                    </span>
                  </div>
                  {paymentType === 'subscription' && (
                    <p className="text-xs text-green-600 font-medium">
                      Save ₹{(Number(plan.priceMonthly) * 2).toLocaleString('en-IN')} yearly →
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {(config.features || []).map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      isCurrent
                        ? 'bg-green-600 hover:bg-green-700'
                        : config.popular
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : ''
                    }`}
                    variant={isCurrent || config.popular ? 'default' : 'outline'}
                    onClick={() => handlePayment(plan.name, Number(plan.priceMonthly))}
                    disabled={isCurrent || loadingPlan === plan.name}
                  >
                    {loadingPlan === plan.name ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                    ) : isCurrent ? (
                      <><CheckCircle className="w-4 h-4 mr-2" />Current Plan</>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        {paymentType === 'subscription' ? 'Subscribe' : 'Pay Once'}
                        {' '}— ₹{Number(plan.priceMonthly).toLocaleString('en-IN')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Cancel + Manage */}
      {isActive && subscription?.paymentType === 'subscription' && (
        <Card className="border-red-100">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="font-medium text-slate-700">Cancel Subscription</p>
              <p className="text-sm text-slate-400 mt-0.5">
                You'll retain access until end of billing period
              </p>
            </div>
            <Button
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => {
                if (confirm('Are you sure you want to cancel?')) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cancelling...</>
              ) : (
                'Cancel Subscription'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Mode Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
          <div className="text-sm text-yellow-800">
            <strong>Test Mode:</strong> Card:{' '}
            <code className="bg-yellow-100 px-1 rounded font-mono">4111 1111 1111 1111</code>
            {' '}· Expiry: any future · CVV:{' '}
            <code className="bg-yellow-100 px-1 rounded font-mono">123</code>
            {' '}· UPI:{' '}
            <code className="bg-yellow-100 px-1 rounded font-mono">success@razorpay</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}