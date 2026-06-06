<?php

namespace App\Providers;

use App\Models\Patient;
use App\Observers\PatientObserver;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Patient::observe(PatientObserver::class);

        RateLimiter::for('login', fn ($r) => Limit::perMinute(5)->by($r->ip()));

        Scramble::routes(function (Route $route): bool {
            return str_starts_with($route->uri, 'api/')
                && ! str_starts_with($route->uri, 'api/test');
        });

        Scramble::afterOpenApiGenerated(function (OpenApi $openApi): void {
            $openApi->secure(SecurityScheme::http('bearer', 'JWT'));
        });
    }
}
