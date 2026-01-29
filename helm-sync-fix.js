// ═══════════════════════════════════════════════════════════════════════════
// HELM COMPLETE SYNC FIX - v2.0
// Paste this into browser console on your HELM deployment to fix sync
// Or include as <script> before </body>
// ═══════════════════════════════════════════════════════════════════════════

(function() {
    'use strict';
    
    console.log('[HELM SYNC FIX] Initializing...');
    
    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURATION - All known localStorage keys the app uses
    // ═══════════════════════════════════════════════════════════════════════
    const KEYS = {
        // Viewings - multiple possible keys
        viewings: ['propertyViewings', 'helm_viewings'],
        // Properties
        properties: ['elevate_properties', 'helm_properties', 'properties'],
        // Clients/Pipeline
        clients: ['elevate_clients', 'helm_clients', 'pipeline_clients'],
        // Agents
        agents: ['helm_agents', 'agents'],
        // XP/Stats
        xp: 'helmXP',
        stats: ['helm_user_stats', 'user_stats'],
        // Sync flags
        syncDone: 'helm_sync_complete',
        firstSync: 'hpm_supabase_first_sync_done'
    };
    
    // ═══════════════════════════════════════════════════════════════════════
    // HELPER - Get data from any of the possible keys
    // ═══════════════════════════════════════════════════════════════════════
    function getLocalData(keys) {
        const keyList = Array.isArray(keys) ? keys : [keys];
        for (const key of keyList) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed)) return { key, data: parsed };
                    if (typeof parsed === 'object' && parsed !== null) {
                        return { key, data: Object.values(parsed) };
                    }
                } catch (e) {
                    continue;
                }
            }
        }
        return { key: keyList[0], data: [] };
    }
    
    function setLocalData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // UPLOAD FUNCTIONS - Push local data to Supabase
    // ═══════════════════════════════════════════════════════════════════════
    
    async function uploadViewings() {
        if (!window.supabase) return { success: 0, failed: 0 };
        
        const { data: viewings } = getLocalData(KEYS.viewings);
        console.log(`[SYNC] Uploading ${viewings.length} viewings...`);
        
        let success = 0, failed = 0;
        
        for (const v of viewings) {
            try {
                const { error } = await window.supabase.from('viewings').upsert({
                    id: String(v.id || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
                    client_name: v.clientName || v.name || v.visitor || '',
                    client_phone: v.phone || v.clientPhone || v.visitorPhone || '',
                    client_email: v.email || v.clientEmail || '',
                    property_id: String(v.propertyId || ''),
                    property_name: v.propertyName || v.property || '',
                    property_address: v.propertyAddress || v.address || '',
                    viewing_date: v.date || v.viewing_date || null,
                    viewing_time: v.time || v.viewing_time || '',
                    status: v.status || 'scheduled',
                    outcome: v.outcome || '',
                    agent_id: v.agentId || v.agent_id || '',
                    notes: v.notes || '',
                    confirmed: v.confirmed || false,
                    added_by_name: v.addedByName || v.added_by_name || '',
                    booked_by_name: v.bookedByName || v.booked_by_name || '',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
                
                if (error) {
                    console.error('[SYNC] Viewing error:', v.clientName || v.name, error.message);
                    failed++;
                } else {
                    success++;
                }
            } catch (e) {
                failed++;
            }
        }
        
        console.log(`[SYNC] Viewings: ${success} uploaded, ${failed} failed`);
        return { success, failed };
    }
    
    async function uploadProperties() {
        if (!window.supabase) return { success: 0, failed: 0 };
        
        const { data: properties } = getLocalData(KEYS.properties);
        console.log(`[SYNC] Uploading ${properties.length} properties...`);
        
        let success = 0, failed = 0;
        
        for (const p of properties) {
            try {
                const { error } = await window.supabase.from('properties').upsert({
                    id: String(p.id || `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
                    name: p.name || '',
                    address: p.address || '',
                    postcode: p.postcode || '',
                    borough: p.borough || '',
                    rent: parseFloat(p.rent) || 0,
                    lha_rate: parseFloat(p.lhaRate || p.lha_rate) || 0,
                    bedrooms: parseInt(p.bedrooms) || 0,
                    property_type: p.propertyType || p.property_type || 'studio',
                    status: p.status || 'available',
                    lat: p.lat ? parseFloat(p.lat) : null,
                    lng: p.lng ? parseFloat(p.lng) : null,
                    landlord: p.landlord || '',
                    landlord_phone: p.landlordPhone || p.landlord_phone || '',
                    landlord_email: p.landlordEmail || p.landlord_email || '',
                    notes: p.notes || '',
                    assigned_to: p.assignedTo || p.assigned_to || '',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
                
                if (error) {
                    console.error('[SYNC] Property error:', p.name || p.address, error.message);
                    failed++;
                } else {
                    success++;
                }
            } catch (e) {
                failed++;
            }
        }
        
        console.log(`[SYNC] Properties: ${success} uploaded, ${failed} failed`);
        return { success, failed };
    }
    
    async function uploadClients() {
        if (!window.supabase) return { success: 0, failed: 0 };
        
        const { data: clients } = getLocalData(KEYS.clients);
        console.log(`[SYNC] Uploading ${clients.length} clients...`);
        
        let success = 0, failed = 0;
        
        for (const c of clients) {
            try {
                const { error } = await window.supabase.from('clients').upsert({
                    id: String(c.id || `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
                    name: c.name || '',
                    phone: c.phone || '',
                    email: c.email || '',
                    stage: c.stage || 'new',
                    property_interest: c.propertyInterest || c.property_interest || '',
                    max_rent: parseFloat(c.maxRent || c.max_rent) || 0,
                    borough_preference: c.boroughPreference || c.borough_preference || '',
                    referral_source: c.referralSource || c.referral_source || '',
                    benefit_type: c.benefitType || c.benefit_type || '',
                    housing_officer: c.housingOfficer || c.housing_officer || '',
                    housing_officer_phone: c.housingOfficerPhone || c.housing_officer_phone || '',
                    council: c.council || '',
                    notes: c.notes || '',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
                
                if (error) {
                    console.error('[SYNC] Client error:', c.name, error.message);
                    failed++;
                } else {
                    success++;
                }
            } catch (e) {
                failed++;
            }
        }
        
        console.log(`[SYNC] Clients: ${success} uploaded, ${failed} failed`);
        return { success, failed };
    }
    
    async function uploadAgents() {
        if (!window.supabase) return { success: 0, failed: 0 };
        
        const { data: agents } = getLocalData(KEYS.agents);
        console.log(`[SYNC] Uploading ${agents.length} agents...`);
        
        let success = 0, failed = 0;
        
        for (const a of agents) {
            try {
                const { error } = await window.supabase.from('agents').upsert({
                    id: String(a.id || `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
                    name: a.name || '',
                    initials: a.initials || (a.name ? a.name.split(' ').map(n => n[0]).join('').toUpperCase() : ''),
                    color: a.color || '#3b82f6',
                    phone: a.phone || '',
                    email: a.email || '',
                    role: a.role || 'agent',
                    active: a.active !== false,
                    xp_points: parseInt(a.xp_points || a.xp) || 0,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
                
                if (error) {
                    console.error('[SYNC] Agent error:', a.name, error.message);
                    failed++;
                } else {
                    success++;
                }
            } catch (e) {
                failed++;
            }
        }
        
        console.log(`[SYNC] Agents: ${success} uploaded, ${failed} failed`);
        return { success, failed };
    }
    
    async function uploadStats() {
        if (!window.supabase) return { success: 0, failed: 0 };
        
        // Get XP
        const xp = parseInt(localStorage.getItem(KEYS.xp)) || 0;
        const { data: stats } = getLocalData(KEYS.stats);
        const statData = stats[0] || {};
        
        // Get current user
        const session = await window.supabase.auth.getSession();
        const user = session?.data?.session?.user;
        const userId = user?.id || 'unknown';
        const userEmail = user?.email || 'unknown';
        
        console.log(`[SYNC] Uploading stats: XP=${xp}`);
        
        try {
            const { error } = await window.supabase.from('user_stats').upsert({
                id: userEmail,
                user_id: userId !== 'unknown' ? userId : null,
                user_email: userEmail,
                xp_points: xp || statData.xp_points || 0,
                total_viewings: statData.total_viewings || 0,
                completed_viewings: statData.completed_viewings || 0,
                cancelled_viewings: statData.cancelled_viewings || 0,
                properties_let: statData.properties_let || 0,
                clients_signed: statData.clients_signed || 0,
                streak_days: statData.streak_days || 0,
                best_streak: statData.best_streak || 0,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
            
            if (error) {
                console.error('[SYNC] Stats error:', error.message);
                return { success: 0, failed: 1 };
            }
            
            // Also update profile XP
            if (userId !== 'unknown') {
                await window.supabase.from('profiles').upsert({
                    id: userId,
                    xp_points: xp || statData.xp_points || 0,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
            }
            
            return { success: 1, failed: 0 };
        } catch (e) {
            return { success: 0, failed: 1 };
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // DOWNLOAD FUNCTIONS - Pull data from Supabase to local
    // ═══════════════════════════════════════════════════════════════════════
    
    async function downloadViewings() {
        if (!window.supabase) return 0;
        
        const { data, error } = await window.supabase
            .from('viewings')
            .select('*')
            .order('viewing_date', { ascending: true });
        
        if (error) {
            console.error('[SYNC] Download viewings error:', error.message);
            return 0;
        }
        
        if (data && data.length > 0) {
            const formatted = data.map(v => ({
                id: v.id,
                name: v.client_name,
                clientName: v.client_name,
                visitor: v.client_name,
                phone: v.client_phone,
                clientPhone: v.client_phone,
                email: v.client_email,
                clientEmail: v.client_email,
                propertyId: v.property_id,
                propertyName: v.property_name,
                property: v.property_name,
                propertyAddress: v.property_address,
                address: v.property_address,
                date: v.viewing_date,
                viewing_date: v.viewing_date,
                time: v.viewing_time,
                viewing_time: v.viewing_time,
                status: v.status,
                outcome: v.outcome,
                agentId: v.agent_id,
                notes: v.notes,
                confirmed: v.confirmed,
                addedByName: v.added_by_name,
                bookedByName: v.booked_by_name,
                updatedAt: v.updated_at
            }));
            
            setLocalData('propertyViewings', formatted);
            console.log(`[SYNC] Downloaded ${data.length} viewings`);
            return data.length;
        }
        
        return 0;
    }
    
    async function downloadProperties() {
        if (!window.supabase) return 0;
        
        const { data, error } = await window.supabase
            .from('properties')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) {
            console.error('[SYNC] Download properties error:', error.message);
            return 0;
        }
        
        if (data && data.length > 0) {
            const formatted = data.map(p => ({
                id: p.id,
                name: p.name,
                address: p.address,
                postcode: p.postcode,
                borough: p.borough,
                rent: p.rent,
                lhaRate: p.lha_rate,
                lha_rate: p.lha_rate,
                bedrooms: p.bedrooms,
                propertyType: p.property_type,
                property_type: p.property_type,
                status: p.status,
                lat: p.lat,
                lng: p.lng,
                landlord: p.landlord,
                landlordPhone: p.landlord_phone,
                landlordEmail: p.landlord_email,
                notes: p.notes,
                assignedTo: p.assigned_to,
                updatedAt: p.updated_at
            }));
            
            setLocalData('elevate_properties', formatted);
            console.log(`[SYNC] Downloaded ${data.length} properties`);
            return data.length;
        }
        
        return 0;
    }
    
    async function downloadClients() {
        if (!window.supabase) return 0;
        
        const { data, error } = await window.supabase
            .from('clients')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) {
            console.error('[SYNC] Download clients error:', error.message);
            return 0;
        }
        
        if (data && data.length > 0) {
            const formatted = data.map(c => ({
                id: c.id,
                name: c.name,
                phone: c.phone,
                email: c.email,
                stage: c.stage,
                propertyInterest: c.property_interest,
                maxRent: c.max_rent,
                boroughPreference: c.borough_preference,
                referralSource: c.referral_source,
                benefitType: c.benefit_type,
                housingOfficer: c.housing_officer,
                housingOfficerPhone: c.housing_officer_phone,
                council: c.council,
                notes: c.notes,
                lastContact: c.last_contact,
                updatedAt: c.updated_at
            }));
            
            setLocalData('elevate_clients', formatted);
            console.log(`[SYNC] Downloaded ${data.length} clients`);
            return data.length;
        }
        
        return 0;
    }
    
    async function downloadAgents() {
        if (!window.supabase) return 0;
        
        const { data, error } = await window.supabase
            .from('agents')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) {
            console.error('[SYNC] Download agents error:', error.message);
            return 0;
        }
        
        if (data && data.length > 0) {
            setLocalData('helm_agents', data);
            console.log(`[SYNC] Downloaded ${data.length} agents`);
            return data.length;
        }
        
        return 0;
    }
    
    async function downloadStats() {
        if (!window.supabase) return 0;
        
        const session = await window.supabase.auth.getSession();
        const userEmail = session?.data?.session?.user?.email;
        
        if (!userEmail) return 0;
        
        const { data, error } = await window.supabase
            .from('user_stats')
            .select('*')
            .eq('user_email', userEmail)
            .single();
        
        if (error) {
            console.error('[SYNC] Download stats error:', error.message);
            return 0;
        }
        
        if (data) {
            localStorage.setItem('helmXP', String(data.xp_points || 0));
            setLocalData('helm_user_stats', [data]);
            console.log(`[SYNC] Downloaded stats: XP=${data.xp_points}`);
            return 1;
        }
        
        return 0;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // MASTER SYNC FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    async function uploadAll() {
        console.log('[SYNC] ═══ UPLOADING ALL DATA TO CLOUD ═══');
        
        const results = {
            viewings: await uploadViewings(),
            properties: await uploadProperties(),
            clients: await uploadClients(),
            agents: await uploadAgents(),
            stats: await uploadStats()
        };
        
        const totalSuccess = Object.values(results).reduce((sum, r) => sum + r.success, 0);
        const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
        
        console.log(`[SYNC] ═══ UPLOAD COMPLETE: ${totalSuccess} success, ${totalFailed} failed ═══`);
        
        // Show toast if function exists
        if (typeof showToast === 'function') {
            showToast('Sync Complete', `Uploaded ${totalSuccess} items to cloud`, totalFailed > 0 ? 'warning' : 'success');
        }
        
        return results;
    }
    
    async function downloadAll() {
        console.log('[SYNC] ═══ DOWNLOADING ALL DATA FROM CLOUD ═══');
        
        const counts = {
            viewings: await downloadViewings(),
            properties: await downloadProperties(),
            clients: await downloadClients(),
            agents: await downloadAgents(),
            stats: await downloadStats()
        };
        
        const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
        console.log(`[SYNC] ═══ DOWNLOAD COMPLETE: ${total} items ═══`);
        
        // Trigger UI refresh
        if (typeof renderHelmViewingsList === 'function') renderHelmViewingsList();
        if (typeof initViewingsTimetable === 'function') initViewingsTimetable();
        if (typeof updateViewingsStats === 'function') updateViewingsStats();
        if (typeof updateMarkers === 'function') updateMarkers();
        if (typeof updateHelmDashboard === 'function') updateHelmDashboard();
        
        // Show toast if function exists
        if (typeof showToast === 'function') {
            showToast('Download Complete', `Got ${total} items from cloud`, 'success');
        }
        
        return counts;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // EXPOSE GLOBAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    window.HELM_SYNC = {
        uploadAll,
        downloadAll,
        uploadViewings,
        uploadProperties,
        uploadClients,
        uploadAgents,
        uploadStats,
        downloadViewings,
        downloadProperties,
        downloadClients,
        downloadAgents,
        downloadStats,
        // Quick actions
        fixSync: async () => {
            console.log('[SYNC FIX] Running complete sync repair...');
            await uploadAll();
            console.log('[SYNC FIX] Complete! Your data should now be in the cloud.');
        },
        resetFlags: () => {
            localStorage.removeItem('hpm_supabase_first_sync_done');
            localStorage.removeItem('hpm_sync_action');
            localStorage.removeItem('helm_sync_complete');
            console.log('[SYNC] Flags cleared - refresh to see first-time sync modal');
        }
    };
    
    console.log('[HELM SYNC FIX] Ready! Available commands:');
    console.log('  HELM_SYNC.uploadAll()     - Push all local data to cloud');
    console.log('  HELM_SYNC.downloadAll()   - Pull all cloud data to local');
    console.log('  HELM_SYNC.fixSync()       - Complete sync repair');
    console.log('  HELM_SYNC.resetFlags()    - Reset sync flags');
    
})();
