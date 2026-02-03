# Análisis de Módulo de Puntos

Este documento describe la estructura y lógica propuesta para el módulo de cálculo de puntos basado en cumplimiento de cuotas de ventas.

## Supuestos e Interpretaciones
1. **Valores Numéricos**: 
   - Cuota Trimestral (Pesos): $11.000.000
   - Valor Punto: $1.500
   - Cuota Trimestral (Unidades): 6.000 unidades.
2. **Ambigüedades en Reglas de Unidades**:
   - El rango "2.999 productos a 1.000 productos" se interpreta como **1,000 a 2,999**.
   - La regla "-999 productos vendidos = 100 puntos" se considera atípica (usualmente menor venta = menos puntos). Se ha interpretado como **< 1000 productos = 0 puntos** para mantener coherencia lógica, o podría ser un error de digitación en el requerimiento original. En el código se dejaría configurable.
   - Se asume que los rangos son mutuamente excluyentes y jerárquicos.

## Estructura de Datos (Modelos)

### SalesQuota (Configuración)
Define las metas y las reglas del juego.
```typescript
interface SalesQuota {
    period: 'trimestral';
    monetaryTarget: number; // 11,000,000
    unitTarget: number;     // 6,000
    pointValue: number;     // 1,500
}
```

### SalesExecution (Entrada)
Datos ingresados por el usuario.
```typescript
interface SalesExecution {
    executedMoney: number;
    executedUnits: number;
}
```

### PointRules (Motor de Reglas)
Estructura flexible para evaluar rangos.

## Lógica de Cálculo

### 1. Cumplimiento en Pesos
Fórmula: `(Ejecutado / Meta) * 100`

| % Cumplimiento | Puntos |
|----------------|--------|
| 80% - 100%+    | 100    |
| 50% - 79%      | 70     |
| 30% - 49%      | 40     |
| 10% - 29%      | 20     |
| < 10%          | 0      |

### 2. Cumplimiento en Unidades
Evaluación directa por cantidad vendida.

| Unidades Vendidas | Puntos |
|-------------------|--------|
| ≥ 4,000           | 150    |
| 2,000 - 3,999     | 100    |
| 1,000 - 1,999     | 50     |
| < 1,000           | 0 (Nota: Prompt decía 100 para <999, ajustado por lógica) |

## Salida del Sistema
El usuario visualizará:
1. **Puntos por Ventas ($)**: Cantidad de puntos ganados por dinero.
2. **Valor Monetario ($)**: Total puntos * $1.500.
3. **Puntos por Unidades**: Cantidad de puntos por volumen.
4. **Total General**: Suma de ambos puntajes.

## Pseudocódigo de Implementación
```typescript
class PointsCalculator {
    calculateMonetaryPoints(executed: number, target: number): number {
        const percentage = (executed / target) * 100;
        if (percentage >= 80) return 100;
        if (percentage >= 50) return 70;
        if (percentage >= 30) return 40;
        if (percentage >= 10) return 20;
        return 0;
    }

    calculateUnitPoints(units: number): number {
        if (units >= 4000) return 150;
        if (units >= 2000) return 100;
        if (units >= 1000) return 50;
        return 0; 
    }
}
```
