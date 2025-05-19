import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const EQUIPOS = [
    { nombre: "Ampolleta LED (unidad)", watts: 10, consumoPromedio: 0.01 },
    { nombre: "Refrigerador", watts: 300, consumoPromedio: 1.2, consumoFijo: 1.8 },
    { nombre: "Televisor LED", watts: 120, consumoPromedio: 0.6 },
    { nombre: "Computador portátil", watts: 80, consumoPromedio: 0.4 },
    { nombre: "Computador de escritorio", watts: 250, consumoPromedio: 1.2 },
    { nombre: "Lavadora", watts: 800, consumoPromedio: 0.6 },
    { nombre: "Microondas", watts: 1000, consumoPromedio: 0.3 },
    { nombre: "Hervidor", watts: 1500, consumoPromedio: 0.4 },
    { nombre: "Tostador", watts: 1000, consumoPromedio: 0.2 },
    { nombre: "Juguera", watts: 300, consumoPromedio: 0.1 },
    { nombre: "Aire acondicionado (Split)", watts: 2000, consumoPromedio: 2.5 },
    { nombre: "Bomba de agua", watts: 1000, consumoPromedio: 0.8 },
    { nombre: "Calefont/termoeléctrico", watts: 2000, consumoPromedio: 2.0 },
    { nombre: "Cargador de celular", watts: 18, consumoPromedio: 0.05 },
    { nombre: "Router de internet", watts: 15, consumoPromedio: 0.3 },
    { nombre: "Congeladora", watts: 120, consumoPromedio: 0.68, consumoFijo: 0.68 },
    { nombre: "Plancha", watts: 1200, consumoPromedio: 0.5 },
    { nombre: "Horno eléctrico", watts: 1800, consumoPromedio: 1.5 },
    { nombre: "Consola de juegos", watts: 150, consumoPromedio: 0.4 },
    { nombre: "Decodificador de TV", watts: 12, consumoPromedio: 0.2 },
    { nombre: "Plancha de pelo", watts: 300, consumoPromedio: 0.2 },
    { nombre: "Secador de pelo", watts: 1800, consumoPromedio: 0.3 },
    { nombre: "Estufa a pellet", watts: 500, consumoPromedio: 1.0 }
];

export default function SimuladorGenerador() {
    // Estados y funciones
    const [horasUso, setHorasUso] = useState(EQUIPOS.reduce((acc, eq) => ({ ...acc, [eq.nombre]: 0 }), {}));
    const [cantidades, setCantidades] = useState(EQUIPOS.reduce((acc, eq) => ({ ...acc, [eq.nombre]: 1 }), {}));
    const [horasFuncionamiento, setHorasFuncionamiento] = useState(4);
    const [mostrarResultado, setMostrarResultado] = useState(false);
    const precioPorLitro = 1390;

    const calcularPotencia = () => {
        const consumoTotal = EQUIPOS.reduce((acc, eq) => {
            const cantidad = cantidades[eq.nombre] || 1;
            const horas = horasUso[eq.nombre] || 0;
            const potencia = eq.consumoFijo ? eq.consumoFijo * 1000 : eq.watts * horas;
            return acc + potencia * cantidad;
        }, 0);
        const simultaneidad = 0.6;
        const potenciaMinima = (consumoTotal * simultaneidad) / horasFuncionamiento;
        return Math.ceil(potenciaMinima / 100) * 100;
    };

    const calcularConsumoDiario = (eq) => {
        const cantidad = cantidades[eq.nombre] || 1;
        if (eq.consumoFijo) return eq.consumoFijo * 1000 * cantidad;
        const horas = horasUso[eq.nombre] || 0;
        return eq.watts * horas * cantidad;
    };

    const calcularAlerta = (eq) => {
        const consumoReal = calcularConsumoDiario(eq) / 1000;
        return consumoReal > eq.consumoPromedio * 1.5 ? "⚠️ Alto" : "✅";
    };

    const totalConsumoDiario = EQUIPOS.reduce((acc, eq) => acc + calcularConsumoDiario(eq), 0);
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
            <h1>Simulador de Generador</h1>
            <div id="resumen-generador">
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th>Equipo</th>
                            <th>Potencia (W)</th>
                            <th>Cantidad</th>
                            <th>Horas/día</th>
                            <th>Consumo diario (Wh)</th>
                            <th>Promedio (kWh/día)</th>
                            <th>Alerta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {EQUIPOS.map((eq) => (
                            <tr key={eq.nombre}>
                                <td>{eq.nombre}</td>
                                <td style={{ textAlign: 'right' }}>{eq.watts}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <input type="number" min="1" value={cantidades[eq.nombre]} onChange={(e) => setCantidades({ ...cantidades, [eq.nombre]: parseInt(e.target.value) || 1 })} style={{ width: '60px', textAlign: 'right' }} />
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <input type="number" min="0" step="0.5" value={horasUso[eq.nombre]} onChange={(e) => setHorasUso({ ...horasUso, [eq.nombre]: parseFloat(e.target.value) || 0 })} style={{ width: '60px', textAlign: 'right' }} />
                                </td>
                                <td style={{ textAlign: 'right' }}>{calcularConsumoDiario(eq)}</td>
                                <td style={{ textAlign: 'right' }}>{eq.consumoPromedio}</td>
                                <td style={{ textAlign: 'center' }}>{calcularAlerta(eq)}</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                            <td colSpan={4} style={{ textAlign: 'right' }}>Total consumo diario (Wh)</td>
                            <td style={{ textAlign: 'right' }}>{totalConsumoDiario}</td>
                            <td colSpan={2}></td>
                        </tr>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                            <td colSpan={4} style={{ textAlign: 'right' }}>Total consumo mensual (kWh)</td>
                            <td style={{ textAlign: 'right' }}>{totalConsumoMensual.toFixed(2)}</td>
                            <td colSpan={2}></td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ marginTop: '1rem' }}>
                    <label>Horas continuas que funcionará el generador:</label>
                    <input type="number" min="1" value={horasFuncionamiento} onChange={(e) => setHorasFuncionamiento(Number(e.target.value))} style={{ marginLeft: '1rem', width: '80px' }} />
                </div>

                <div style={{ marginTop: '1rem' }}>
                    🔋 Consumo estimado de combustible: <strong>{consumoLitros().toFixed(1)} litros</strong><br />
                    💰 Costo estimado: <strong>${costoCombustible().toLocaleString('es-CL')}</strong>
                </div>

                {mostrarResultado && (
                    <div style={{ marginTop: '2rem', backgroundColor: '#e0f2fe', padding: '1rem', borderRadius: '6px' }}>
                        <p>🔌 Según tus datos, necesitas un generador de al menos:</p>
                        <h2>{calcularPotencia()} W ({(calcularPotencia() / 1000).toFixed(1)} kW)</h2>
                        <p>* Estimado usando 60% de simultaneidad y {horasFuncionamiento} horas de uso continuo.</p>
                    </div>
                )}
            </div>

            <button onClick={() => setMostrarResultado(true)} style={{ marginTop: '1rem', backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none' }}>Calcular Generador</button>
            <button onClick={generarPDF} style={{ marginTop: '1rem', marginLeft: '1rem', backgroundColor: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none' }}>Descargar PDF</button>
        </div>
    );
}
