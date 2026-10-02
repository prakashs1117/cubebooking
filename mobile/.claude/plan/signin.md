#signin screen
#signup screen

Create a component individual component where input box and button can be used in multiplaces also use the theme.json for the colors and develop a signin screen as per the screenshot and the reference code and make it more customizable components

also i am giving code in html convert this to react native code where you can understand the form inputs and icons.
here there is an icon save icons as .svg file and use the icons as its used in other files.

<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#1b7e79",
              "background-light": "#f6f8f8",
              "background-dark": "#12201f",
            },
            fontFamily: {
              "display": ["Inter"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
          },
        },
      }
    </script>
<title>Sign In</title>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="font-display bg-background-light dark:bg-background-dark text-[#121717] min-h-screen flex items-center justify-center p-4">
<!-- Mobile Container -->
<div class="relative w-full max-w-[420px] bg-white dark:bg-[#1a2b2a] rounded-xl shadow-xl overflow-hidden flex flex-col p-6 sm:p-8">
<!-- Top App Bar / Back Navigation -->
<div class="flex items-center justify-between mb-8">
<button class="text-[#121717] dark:text-white flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<div class="flex-1"></div>
</div>
<!-- Logo Placeholder -->
<div class="flex flex-col items-center mb-8">
<div class="size-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
<span class="material-symbols-outlined text-primary text-4xl" style="font-variation-settings: 'FILL' 1">shield_person</span>
</div>
<h1 class="text-[#121717] dark:text-white text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
<p class="text-[#668583] text-base">Sign in to continue</p>
</div>
<!-- Sign In Form -->
<form class="space-y-5" onsubmit="return false;">
<!-- Email Field -->
<div class="flex flex-col gap-2">
<label class="text-[#121717] dark:text-white text-sm font-semibold ml-1">Email</label>
<div class="relative flex items-center">
<span class="material-symbols-outlined absolute left-4 text-[#668583]">mail</span>
<input class="w-full h-14 pl-12 pr-4 bg-white dark:bg-[#12201f] border border-[#dce4e4] dark:border-primary/20 rounded-lg text-[#121717] dark:text-white placeholder:text-[#668583] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="name@example.com" type="email"/>
</div>
</div>
<!-- Password Field -->
<div class="flex flex-col gap-2">
<label class="text-[#121717] dark:text-white text-sm font-semibold ml-1">Password</label>
<div class="relative flex items-center">
<span class="material-symbols-outlined absolute left-4 text-[#668583]">lock</span>
<input class="w-full h-14 pl-12 pr-12 bg-white dark:bg-[#12201f] border border-[#dce4e4] dark:border-primary/20 rounded-lg text-[#121717] dark:text-white placeholder:text-[#668583] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="••••••••" type="password"/>
<button class="absolute right-4 text-[#668583] hover:text-primary transition-colors" type="button">
<span class="material-symbols-outlined">visibility</span>
</button>
</div>
</div>
<!-- Forgot Password -->
<div class="flex justify-end">
<a class="text-primary text-sm font-semibold hover:underline" href="#">Forgot Password?</a>
</div>
<!-- Sign In Button -->
<button class="w-full h-14 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-[#15625f] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Sign In
            </button>
</form>
<!-- Divider -->
<div class="relative my-8">
<div class="absolute inset-0 flex items-center">
<div class="w-full border-t border-[#dce4e4] dark:border-primary/10"></div>
</div>
<div class="relative flex justify-center text-sm">
<span class="px-3 bg-white dark:bg-[#1a2b2a] text-[#668583]">Or continue with</span>
</div>
</div>
<!-- Social Login -->
<div class="grid grid-cols-2 gap-4">
<button class="flex items-center justify-center gap-3 h-12 border border-[#dce4e4] dark:border-primary/20 rounded-lg bg-white dark:bg-[#12201f] hover:bg-gray-50 dark:hover:bg-primary/5 transition-colors">
<div class="w-5 h-5 bg-contain bg-no-repeat bg-center" data-alt="Google colorful logo icon" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBPQjT6yL5BR9ea456M6hSyR9ZOAKQPnS9KyPfvwYRaVv1HCrUCAS6C11rm35yraUsAtOShGEmtckONR1jL3qJ5uOBSBLHcGClU3lNDhtD1iG61zbw_wFwn9lL2WuhXAcqF3LspAbJhDXGoAvxpTvR_o7fHm0N39imNqQ7hEiNfmWYDHVFpN3umnQAtnUusHn6yzjwhcyYOUW09cTgd1Y7cga-LRSxFxVsMQfJTYG7qQf2-4XIdZ1L0ivOgY9YATvqNoiuqY1Cxlb4');"></div>
<span class="text-sm font-semibold text-[#121717] dark:text-white">Google</span>
</button>
<button class="flex items-center justify-center gap-3 h-12 border border-[#dce4e4] dark:border-primary/20 rounded-lg bg-white dark:bg-[#12201f] hover:bg-gray-50 dark:hover:bg-primary/5 transition-colors">
<div class="w-5 h-5 bg-contain bg-no-repeat bg-center" data-alt="Apple brand logo icon dark" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAxok5mCj54s7KYjn3WNcoHn-fDXFUjmuSqNbEL1znnzAcKV041KooVa3ffo-7-_wDtE-qhnJ0scO3tGcf6xjDY_ePxhOu70OaWPpXYb2sDZjkKD2PaWz1PSYDlJ-E24JWfx1vvrJmU0aO0lNouTNfI-gVbY0r4P2wR_Q1fZU5fhTtzkYcSJIvbVgfrd7AEvUdgMc5AO7K5HOJitRczOPzpYYgpqSkqhkZeFfUS-W_k6O3QQwOi56vqprrsuxTO7gju9PWJukRLGxY');"></div>
<span class="text-sm font-semibold text-[#121717] dark:text-white">Apple</span>
</button>
</div>
<!-- Footer -->
<div class="mt-auto pt-8 text-center">
<p class="text-[#668583] text-sm">
                Don't have an account? 
                <a class="text-primary font-bold hover:underline ml-1" href="#">Sign Up</a>
</p>
</div>
</div>
</body></html>
