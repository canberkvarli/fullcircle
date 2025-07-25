import { useEffect, useState, useRef } from 'react';
import { FIRESTORE } from '@/services/FirebaseConfig';
import { useUserContext } from '@/context/UserContext';

export const useUserSubscription = () => {
  const { userData, setUserData, currentUser } = useUserContext();
  const [isListening, setIsListening] = useState(false);
  const lastSubscriptionData = useRef<any>(null);

  // Real-time subscription listener with enhanced debugging
  useEffect(() => {
    if (!currentUser?.uid) {
      console.log('❌ No currentUser.uid, skipping subscription listener');
      return;
    }

    const unsubscribe = FIRESTORE.collection('users')
      .doc(currentUser.uid)
      .onSnapshot(
        (doc) => {
          
          if (doc.exists) {
            const freshData: any = doc.data();
            const newSubscription = freshData.subscription;

            // Compare with last known data to avoid duplicate processing
            const newDataString = JSON.stringify(newSubscription);
            const lastDataString = JSON.stringify(lastSubscriptionData.current);
            
            if (newDataString === lastDataString) {
              console.log('⏭️ Subscription data unchanged, skipping update');
              return;
            }
            
            // Update our reference
            lastSubscriptionData.current = newSubscription;
            
            // Check for specific subscription events
            const currentSubscription = userData.subscription;
            
            const shouldUpdate = 
              // Any subscription data exists and it's different
              newSubscription && 
              JSON.stringify(newSubscription) !== JSON.stringify(currentSubscription);

            if (shouldUpdate) {
              const event = getSubscriptionEvent(currentSubscription, newSubscription);
              console.log('🎯 Subscription update triggered!', {
                event,
                isActive: newSubscription.isActive,
                status: newSubscription.status,
                planType: newSubscription.planType,
                subscriptionId: newSubscription.subscriptionId
              });
              
              // Force update the subscription data
              setUserData(prevData => {
                const updatedData = {
                  ...prevData,
                  subscription: newSubscription
                };
                console.log('🔄 Updated userData with new subscription:', JSON.stringify(updatedData.subscription, null, 2));
                return updatedData;
              });
            } else {
              console.log('⏸️ No subscription update needed');
            }
          } else {
            console.log('❌ Document does not exist');
          }
        },
        (error) => {
          console.error('❌ Error listening to subscription changes:', error);
        }
      );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]); // Minimal dependencies

  // Helper function to identify the subscription event
  const getSubscriptionEvent = (current: any, updated: any) => {
    if (!current?.subscriptionId && updated?.subscriptionId) return 'CREATED';
    if (current?.status === 'incomplete' && updated?.status === 'active') return 'ACTIVATED';
    if (!current?.cancelAtPeriodEnd && updated?.cancelAtPeriodEnd) return 'CANCELED';
    if (current?.cancelAtPeriodEnd && !updated?.cancelAtPeriodEnd) return 'REACTIVATED';
    if (updated?.status === 'canceled') return 'EXPIRED';
    if (current?.isActive !== updated?.isActive) return 'ACTIVE_STATUS_CHANGED';
    return 'UPDATED';
  };

  // Manual refresh function you can call if needed
  const forceRefreshSubscription = async () => {
    if (!currentUser?.uid) return;
    
    console.log('🔄 Force refreshing subscription data...');
    try {
      const doc = await FIRESTORE.collection('users').doc(currentUser.uid).get();
      if (doc.exists) {
        const freshData = doc.data();
        if (freshData?.subscription) {
          console.log('🎯 Force updating subscription:', freshData.subscription);
          setUserData(prevData => ({
            ...prevData,
            subscription: freshData.subscription
          }));
        }
      }
    } catch (error) {
      console.error('❌ Error force refreshing subscription:', error);
    }
  };

  // Rest of your helper functions...
  const getSubscriptionInfo = () => {
    const subscription = userData.subscription;
    
    if (!subscription?.subscriptionId) {
      return {
        hasSubscription: false,
        isActive: false,
        displayText: "No active subscription",
        timeRemaining: null,
        canUpgrade: true,
        canCancel: false,
        canReactivate: false,
        planType: null,
        daysRemaining: 0
      };
    }

    const now = Date.now();
    const periodEnd = subscription.currentPeriodEnd ? subscription.currentPeriodEnd * 1000 : null;
    const daysRemaining = periodEnd ? Math.max(0, Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24))) : 0;
    
    const isActive = subscription.isActive && 
                    subscription.status === 'active' && 
                    periodEnd && 
                    periodEnd > now;
    
    const isCanceled = subscription.cancelAtPeriodEnd;
    const isProcessing = subscription.status === 'incomplete';
    
    let displayText = "";
    let timeRemaining: any = "";
    
    if (isProcessing) {
      displayText = "Subscription Processing";
      timeRemaining = "Payment is being processed";
    } else if (isActive && !isCanceled) {
      displayText = `FullCircle ${subscription.planType === 'yearly' ? 'Yearly' : 'Monthly'} Active`;
      timeRemaining = daysRemaining > 0 
        ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
        : "Expires today";
    } else if (isActive && isCanceled) {
      displayText = "Subscription Ending Soon";
      timeRemaining = daysRemaining > 0 
        ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`
        : "Expires today";
    } else if (subscription.status === 'canceled') {
      displayText = "Subscription Canceled";
      timeRemaining = null;
    } else {
      displayText = `Subscription ${subscription.status || 'Inactive'}`;
      timeRemaining = null;
    }

    return {
      hasSubscription: true,
      isActive: isActive || isProcessing,
      displayText,
      timeRemaining,
      canUpgrade: !isActive && !isProcessing,
      canCancel: Boolean(isActive && !isCanceled),
      canReactivate: Boolean(isCanceled && isActive),
      planType: subscription.planType,
      daysRemaining: daysRemaining
    };
  };

  const getRemainingDays = () => {
    if (!userData.subscription?.currentPeriodEnd) return 0;
    const now = Math.floor(Date.now() / 1000);
    const remaining = Math.max(0, Math.ceil((userData.subscription.currentPeriodEnd - now) / (60 * 60 * 24)));
    return remaining;
  };

  return {
    subscription: userData.subscription,
    subscriptionInfo: getSubscriptionInfo(),
    remainingDays: getRemainingDays(),
    hasSubscription: !!userData.subscription?.subscriptionId,
    isActive: userData.subscription?.isActive === true || userData.subscription?.status === 'incomplete',
    forceRefreshSubscription // Export this for manual refresh if needed
  };
};