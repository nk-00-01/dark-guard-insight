import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Plus, Shield, LogOut, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SubscriptionPlan {
  id: string;
  service_name: string;
  plan_name: string;
  amount: number;
  currency: string;
  start_date: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionPlan | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    service_name: '',
    plan_name: '',
    amount: '',
    currency: 'USD',
    start_date: '',
    expiry_date: '',
    status: 'active',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch subscriptions
  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching subscriptions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: "Signed out successfully",
      description: "You've been logged out of your account.",
    });
  };

  const resetForm = () => {
    setFormData({
      service_name: '',
      plan_name: '',
      amount: '',
      currency: 'USD',
      start_date: '',
      expiry_date: '',
      status: 'active',
    });
    setEditingSubscription(null);
  };

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .insert([{
          user_id: user?.id,
          service_name: formData.service_name,
          plan_name: formData.plan_name,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          start_date: formData.start_date,
          expiry_date: formData.expiry_date,
          status: formData.status,
        }]);

      if (error) throw error;

      toast({
        title: "Subscription added!",
        description: "Your subscription plan has been saved.",
      });

      setShowAddDialog(false);
      resetForm();
      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error adding subscription",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscription) return;
    
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          service_name: formData.service_name,
          plan_name: formData.plan_name,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          start_date: formData.start_date,
          expiry_date: formData.expiry_date,
          status: formData.status,
        })
        .eq('id', editingSubscription.id);

      if (error) throw error;

      toast({
        title: "Subscription updated!",
        description: "Your subscription plan has been updated.",
      });

      setEditingSubscription(null);
      resetForm();
      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error updating subscription",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Subscription deleted",
        description: "The subscription plan has been removed.",
      });

      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error deleting subscription",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (subscription: SubscriptionPlan) => {
    setEditingSubscription(subscription);
    setFormData({
      service_name: subscription.service_name,
      plan_name: subscription.plan_name,
      amount: subscription.amount.toString(),
      currency: subscription.currency,
      start_date: subscription.start_date,
      expiry_date: subscription.expiry_date,
      status: subscription.status,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary animate-glow-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary animate-glow-pulse" />
            <h1 className="text-xl font-bold glow-text">DarkGuard Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.length}</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscriptions.filter(s => s.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${subscriptions
                  .filter(s => s.status === 'active')
                  .reduce((sum, s) => sum + s.amount, 0)
                  .toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>
                  Manage your service subscriptions and track expenses
                </CardDescription>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Subscription</DialogTitle>
                    <DialogDescription>
                      Add details about your service subscription plan.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddSubscription} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Name</Label>
                      <Input
                        id="service"
                        placeholder="e.g., Netflix, Spotify"
                        value={formData.service_name}
                        onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plan">Plan Name</Label>
                      <Input
                        id="plan"
                        placeholder="e.g., Premium, Basic"
                        value={formData.plan_name}
                        onChange={(e) => setFormData({...formData, plan_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="9.99"
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start">Start Date</Label>
                        <Input
                          id="start"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          type="date"
                          value={formData.expiry_date}
                          onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Add Subscription
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading subscriptions...</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No subscriptions added yet.</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Subscription
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{subscription.service_name}</h3>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {subscription.plan_name} - {subscription.currency} {subscription.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subscription.start_date} to {subscription.expiry_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(subscription)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubscription(subscription.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>
                Update your subscription plan details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubscription} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-service">Service Name</Label>
                <Input
                  id="edit-service"
                  value={formData.service_name}
                  onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-plan">Plan Name</Label>
                <Input
                  id="edit-plan"
                  value={formData.plan_name}
                  onChange={(e) => setFormData({...formData, plan_name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start">Start Date</Label>
                  <Input
                    id="edit-start"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-expiry">Expiry Date</Label>
                  <Input
                    id="edit-expiry"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Update Subscription
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}