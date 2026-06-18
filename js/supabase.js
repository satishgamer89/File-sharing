import { createClient }
from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl =
'https://imtjsxymsbeezpggdvpd.supabase.co';

const supabaseKey =
'sb_publishable_wEKrcNR0Et7FixZIBMJg4Q_tiSIl4C1';

export const supabase =
createClient(
    supabaseUrl,
    supabaseKey
);
