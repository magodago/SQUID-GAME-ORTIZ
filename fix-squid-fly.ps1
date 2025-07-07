# Script para arreglar el botón de Squid Fly
$content = Get-Content "index.html" -Raw

# Eliminar el bloque flotante de Squid Fly (sin emojis)
$pattern1 = '<!-- Squid Fly Button \(Available for all players\) -->\s*<div class="squid-fly-container" id="squidFlyContainer">\s*<button class="squid-fly-btn" id="squidFlyBtn">\s*.*SQUID FLY.*\s*</button>\s*</div>'
$content = $content -replace $pattern1, ''

# Agregar el sobre de Squid Fly después del sobre de ROBO
$pattern2 = '(<button class="envelope-btn pvp-btn" id="pvpBtn">\s*<div class="envelope-content">\s*<span class="envelope-text">ROBO</span>\s*</div>\s*</button>)'
$replacement = '$1
      <button class="envelope-btn squidfly-btn" id="squidFlyBtn">
        <div class="envelope-content">
          <span class="envelope-text">SQUID FLY</span>
        </div>
      </button>'
$content = $content -replace $pattern2, $replacement

# Guardar el archivo
$content | Set-Content "index.html" -Encoding UTF8

Write-Host "Archivo index.html actualizado correctamente" 