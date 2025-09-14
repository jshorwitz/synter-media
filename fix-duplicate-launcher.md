# Fix Duplicate Launcher on Dashboard

**Problem:**  
A floating “N” launcher button is showing up at the **bottom-left sidebar**, overlapping the user card. It should **only exist in the top-right of the dashboard**.  

---

## Tasks

1. **Render launcher only once in AppShell**  
   - Move `<Launcher />` into the global layout (`AppShell.tsx` or equivalent).  
   - Place it in the **main content column**, positioned `fixed` at the top-right.  
   - Example:  

   ```tsx
   // AppShell.tsx
   export function AppShell({ children }: { children: React.ReactNode }) {
     return (
       <div className="grid grid-cols-[240px_1fr] h-dvh">
         <Sidebar />
         <div className="relative">
           {children}

           {/* single launcher in top-right */}
           <div className="fixed top-4 right-4 z-40 pointer-events-auto">
             <Launcher />
           </div>
         </div>
       </div>
     );
   }
   ```

2. **Remove duplicates**  
   - Search the entire codebase for `<Launcher` and **delete any other instance** (e.g., in `Dashboard.tsx`, `Onboarding.tsx`, or sidebar footer).

3. **Prevent re-injection / multiple mounts**  
   - If the launcher initializes a third-party widget, guard it with a global flag:  

   ```tsx
   useEffect(() => {
     if ((window as any).__launcherMounted) return;
     (window as any).__launcherMounted = true;
     // init code here…
   }, []);
   ```

4. **Fix CSS positioning**  
   - Delete or override any old CSS that places the launcher at the bottom-left.  
   - Add a global style to enforce **top-right only**:  

   ```css
   .launcher,
   .global-launcher {
     position: fixed !important;
     top: 16px !important;
     right: 16px !important;
     bottom: auto !important;
     left: auto !important;
     z-index: 40;
   }

   /* Kill old bottom-left launcher class */
   .launcher--bottom-left { display: none !important; }
   ```

5. **Sidebar z-index**  
   - Ensure sidebar uses `z-30`.  
   - Ensure launcher container uses `z-40`.  
   - This keeps the launcher visible but not overlapping the sidebar.

---

## Verification

- [ ] Only one launcher appears, in the **top-right**.  
- [ ] No launcher overlaps the sidebar user card at the bottom.  
- [ ] Works across routes and reloads.  
- [ ] No duplicates appear on hot reload (HMR).  
