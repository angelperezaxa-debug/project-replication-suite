-- Tabla de solicitudes públicas de eliminación de cuenta
CREATE TABLE public.account_deletion_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  device_id text,
  ip_masked text,
  user_agent text,
  admin_notes text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT account_deletion_requests_status_chk
    CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  CONSTRAINT account_deletion_requests_email_len_chk
    CHECK (char_length(email) BETWEEN 5 AND 254),
  CONSTRAINT account_deletion_requests_reason_len_chk
    CHECK (reason IS NULL OR char_length(reason) <= 1000)
);

-- Habilitar RLS
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Permetre crear sol·licituds des del client (formulari públic).
-- No permetem llegir/actualitzar/esborrar des del client per protegir
-- la privacitat dels sol·licitants.
CREATE POLICY "anyone_can_create_deletion_request"
  ON public.account_deletion_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Defensa contra abús: validem els camps al servidor a més del check.
    char_length(email) BETWEEN 5 AND 254
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (reason IS NULL OR char_length(reason) <= 1000)
    AND status = 'pending'
    AND processed_at IS NULL
    AND admin_notes IS NULL
  );

CREATE POLICY "no_client_select_deletion_request"
  ON public.account_deletion_requests
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "no_client_update_deletion_request"
  ON public.account_deletion_requests
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "no_client_delete_deletion_request"
  ON public.account_deletion_requests
  FOR DELETE
  TO anon, authenticated
  USING (false);

-- Índexs
CREATE INDEX idx_account_deletion_requests_email
  ON public.account_deletion_requests (email);
CREATE INDEX idx_account_deletion_requests_status_created
  ON public.account_deletion_requests (status, created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_account_deletion_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_account_deletion_requests_updated_at
BEFORE UPDATE ON public.account_deletion_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_account_deletion_requests_updated_at();