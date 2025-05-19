import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const EQUIPOS = [
    { nombre: "Ampolleta LED (10 unidades)", watts: 100, consumoPromedio: "0.1 kWh/día" },
    { nombre: "Refrigerador", watts: 300, consumoPromedio: "1.8 kWh/día" },
    { nombre: "Televisor LED", watts: 120, consumoPromedio: "0.6 kWh/día" },
    { nombre: "Computador portátil", watts: 80, consumoPromedio: "0.4 kWh/día" },
    { nombre: "Computador de escritorio", watts: 250, consumoPromedio: "1.2 kWh/día" },
    { nombre: "Lavadora", watts: 800, consumoPromedio: "0.6 kWh/día" },
    { nombre: "Microondas", watts: 1000, consumoPromedio: "0.3 kWh/día" },
    { nombre: "Hervidor", watts: 1500, consumoPromedio: "0.4 kWh/día" },
    { nombre: "Tostador", watts: 1000, consumoPromedio: "0.2 kWh/día" },
    { nombre: "Juguera", watts: 300, consumoPromedio: "0.1 kWh/día" },
    { nombre: "Aire acondicionado (Split)", watts: 2000, consumoPromedio: "2.5 kWh/día" },
    { nombre: "Bomba de agua", watts: 1000, consumoPromedio: "0.8 kWh/día" },
    { nombre: "Calefont/termoeléctrico", watts: 2000, consumoPromedio: "2.0 kWh/día" },
    { nombre: "Cargador de celular", watts: 18, consumoPromedio: "0.05 kWh/día" },
    { nombre: "Router de internet", watts: 15, consumoPromedio: "0.3 kWh/día" },
    { nombre: "Congeladora", watts: 400, consumoPromedio: "1.0 kWh/día" },
    { nombre: "Plancha", watts: 1200, consumoPromedio: "0.5 kWh/día" },
    { nombre: "Horno eléctrico", watts: 1800, consumoPromedio: "1.5 kWh/día" }
];

export default function SimuladorGenerador() {
    const [horasUso, setHorasUso] = useState(
        EQUIPOS.reduce((acc, eq) => ({ ...acc, [eq.nombre]: 0 }), {})
    );
    const [horasFuncionamiento, setHorasFuncionamiento] = useState(4);
    const [mostrarResultado, setMostrarResultado] = useState(false);
    const precioPorLitro = 1390;

    const calcularPotencia = () => {
        const consumoTotal = EQUIPOS.reduce(
            (acc, eq) => acc + eq.watts * (horasUso[eq.nombre] || 0),
            0
        );
        const simultaneidad = 0.6;
        const potenciaMinima = (consumoTotal * simultaneidad) / horasFuncionamiento;
        return Math.ceil(potenciaMinima / 100) * 100;
    };

    const calcularConsumoDiario = (eq) => eq.watts * (horasUso[eq.nombre] || 0);

    const totalConsumoDiario = EQUIPOS.reduce(
        (acc, eq) => acc + calcularConsumoDiario(eq),
        0
    );

    const totalConsumoMensual = totalConsumoDiario * 30 / 1000;

    const consumoLitros = () => {
        const potencia = calcularPotencia();
        if (potencia <= 2000) return 0.5 * horasFuncionamiento;
        if (potencia <= 4000) return 0.8 * horasFuncionamiento;
        if (potencia <= 6000) return 1.2 * horasFuncionamiento;
        return 1.6 * horasFuncionamiento;
    };

    const costoCombustible = () => consumoLitros() * precioPorLitro;

    const generarPDF = () => {
        const input = document.getElementById("resumen-generador");
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
            pdf.save("simulador_generador.pdf");
        });
    };

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Simulador de Generador</h1>
            <div id="resumen-generador">
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Equipo</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Potencia (W)</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Horas de uso</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Consumo diario (Wh)</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Consumo promedio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {EQUIPOS.map((eq) => (
                            <tr key={eq.nombre}>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{eq.nombre}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{eq.watts}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={horasUso[eq.nombre] || ""}
                                        onChange={(e) =>
                                            setHorasUso({ ...horasUso, [eq.nombre]: parseFloat(e.target.value) || 0 })
                                        }
                                        style={{ width: '100%', padding: '4px', boxSizing: 'border-box', textAlign: 'right' }}
                                    />
                                </td>
                                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{calcularConsumoDiario(eq)}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{eq.consumoPromedio}</td>
                            </tr>
                        ))}
                        <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                            <td colSpan={4} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Total consumo diario (Wh)</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{totalConsumoDiario}</td>
                        </tr>
                        <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                            <td colSpan={4} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Total consumo mensual (kWh)</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{totalConsumoMensual.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ marginTop: '2rem' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                        ¿Cuántas horas continuas funcionará el generador?
                    </label>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={horasFuncionamiento}
                        onChange={(e) => setHorasFuncionamiento(Number(e.target.value))}
                        style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}
                    />
                </div>

                <div style={{ marginTop: '1rem', fontSize: '14px', color: '#333' }}>
                    🔋 Consumo estimado de combustible: <strong>{consumoLitros().toFixed(1)} litros</strong><br />
                    💰 Costo estimado: <strong>${costoCombustible().toLocaleString('es-CL')}</strong>
                </div>

                {mostrarResultado && (
                    <div style={{ marginTop: '2rem', backgroundColor: '#e0f2fe', padding: '1rem', borderRadius: '6px' }}>
                        <p style={{ fontSize: '14px', color: '#333' }}>
                            🔌 Según tus datos, necesitas un generador de al menos:
                        </p>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            {calcularPotencia()} W ({(calcularPotencia() / 1000).toFixed(1)} kW)
                        </h2>
                        <p style={{ fontSize: '14px', marginTop: '0.5rem', color: '#555' }}>
                            * Estimado usando 60% de simultaneidad y {horasFuncionamiento} horas de uso continuo. Se recomienda agregar un margen adicional.
                        </p>
                    </div>
                )}
            </div>
            <button
                onClick={() => setMostrarResultado(true)}
                style={{ marginTop: '1rem', backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none' }}
            >
                Calcular Generador
            </button>
            <button
                onClick={generarPDF}
                style={{ marginTop: '1rem', marginLeft: '1rem', backgroundColor: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none' }}
            >
                Descargar PDF
            </button>
        </div>
    );
}
