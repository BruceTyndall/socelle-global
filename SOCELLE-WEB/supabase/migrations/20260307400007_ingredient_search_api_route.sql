-- WO-OVERHAUL-12: Register ingredient-search edge function in api_route_map
-- ADD ONLY — never modify existing migrations.

INSERT INTO public.api_route_map (route, method, api_registry_id, edge_function_name, description, auth_required, is_active)
VALUES
  ('/functions/v1/ingredient-search', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    'ingredient-search',
    'Ingredient search — full text on inci_name/common_name + alias lookup. Public access.',
    false, true)
ON CONFLICT ON CONSTRAINT api_route_map_route_method_key DO NOTHING;
