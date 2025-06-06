import os
import pandas as pd
import json

# Trabajá desde el directorio del script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

archivo_excel = "productos.xlsx"
archivo_salida = "productos.json"

df = pd.read_excel(archivo_excel)

def fila_a_dict(fila):
    return {
        "CODIGO": str(fila.get("CODIGO", "")) or "",
        "DETALLE": str(fila.get("DETALLE", "")) or "",
        "FAMILIA": str(fila.get("FAMILIA", "")) or "",
        "PROVEEDOR": str(fila.get("PROVEEDOR", "")) or "",
        "MARCA": str(fila.get("MARCA", "")) or "",
        "P": {
            "COSTO": str(fila.get("P.COSTO", "")) or "",
            "VENTA": str(fila.get("P.VENTA", "")) or "",
            "LISTA2": str(fila.get("P.LISTA2", "")) or "",
            "LISTA3": str(fila.get("P.LISTA3", "")) or "",
            "MAYOR": str(fila.get("P.MAYOR", "")) or "",
        },
        "IVA": str(fila.get("IVA", "")) or "",
        "STOCK": str(fila.get("STOCK", "")) or "",
        "STOCK MIN": str(fila.get("STOCK MIN", "")) or "",
        "STOCK IDEAL": str(fila.get("STOCK IDEAL", "")) or ""
    }

data = [fila_a_dict(row) for _, row in df.iterrows()]

with open(archivo_salida, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
