-- Create enum for topup status
CREATE TYPE public.topup_status AS ENUM ('pending', 'reported_paid', 'confirmed', 'canceled');

-- Create enum for alert type
CREATE TYPE public.alert_type AS ENUM ('budget_50', 'budget_80', 'budget_100', 'projection_warning');

-- Create enum for topup provider
CREATE TYPE public.topup_provider AS ENUM ('manual_pix', 'mercadopago_pix');

-- Budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month_key TEXT NOT NULL, -- Format: YYYY-MM
  monthly_limit_cents INTEGER NOT NULL DEFAULT 0,
  auto_reset BOOLEAN NOT NULL DEFAULT true,
  alert_50_enabled BOOLEAN NOT NULL DEFAULT true,
  alert_80_enabled BOOLEAN NOT NULL DEFAULT true,
  alert_100_enabled BOOLEAN NOT NULL DEFAULT true,
  target_consumption NUMERIC(4,1), -- Target km/L
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_key)
);

-- Wallets table
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Topups table
CREATE TABLE public.topups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_cents INTEGER NOT NULL,
  status topup_status NOT NULL DEFAULT 'pending',
  provider topup_provider NOT NULL DEFAULT 'manual_pix',
  pix_copy_paste TEXT,
  pix_qr_code_data_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type alert_type NOT NULL,
  month_key TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, type, month_key)
);

-- Refuels table (for tracking fuel expenses)
CREATE TABLE public.refuels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  station TEXT NOT NULL,
  fuel_type TEXT NOT NULL DEFAULT 'gasolina',
  liters NUMERIC(6,2) NOT NULL,
  price_per_liter NUMERIC(5,2) NOT NULL,
  total_cost_cents INTEGER NOT NULL,
  consumption NUMERIC(4,1),
  odometer INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refuels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budgets
CREATE POLICY "Users can view their own budgets"
ON public.budgets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets"
ON public.budgets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
ON public.budgets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
ON public.budgets FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for wallets
CREATE POLICY "Users can view their own wallet"
ON public.wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet"
ON public.wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
ON public.wallets FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for topups
CREATE POLICY "Users can view their own topups"
ON public.topups FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own topups"
ON public.topups FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topups"
ON public.topups FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for alerts
CREATE POLICY "Users can view their own alerts"
ON public.alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
ON public.alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.alerts FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for refuels
CREATE POLICY "Users can view their own refuels"
ON public.refuels FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own refuels"
ON public.refuels FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own refuels"
ON public.refuels FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own refuels"
ON public.refuels FOR DELETE
USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_topups_updated_at
BEFORE UPDATE ON public.topups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refuels_updated_at
BEFORE UPDATE ON public.refuels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();