import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rgdecammggjzsdavudti.supabase.co";
const supabaseKey = "sb_publishable_2gL7yxqG8r_44ZZzMp4Pw_0D6ROr...";  // tumhara real publishable key
// NOTE: Secret key YHA MAT DALNA ⚠️

export const supabase = createClient(supabaseUrl, supabaseKey);
