
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const EQUIPOS = [
  { nombre: "Ampolleta LED (10 unidades)", watts: 100 },
  { nombre: "Refrigerador", watts: 300 },
  { nombre: "Televisor LED", watts: 120 },
  { nombre: "Computador portátil", watts: 80 },
  { nombre: "Computador de escritorio", watts: 250 },
  { nombre: "Lavadora", watts: 800 },
  { nombre: "Microondas", watts: 1000 },
  { nombre: "Hervidor", watts: 1500 },
  { nombre: "Aire acondicionado (Split)", watts: 2000 },
  { nombre: "Bomba de agua", watts: 1000 },
  { nombre: "Calefont/termoeléctrico", watts: 2000 },
  { nombre: "Cargador de celular", watts: 18 },
  { nombre: "Router de internet", watts: 15 },
  { nombre: "Congeladora", watts: 400 }
];

const logoURL = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Logo_OpenAI.svg/512px-Logo_OpenAI.svg.png";

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
      const logo = new Image();
      logo.src = logoURL;
      logo.onload = () => {
        pdf.addImage(logo, "PNG", 10, 10, 30, 30);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 40, pdfWidth, pdfHeight);
        pdf.save("simulador_generador.pdf");
      };
    });
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img src={logoURL} alt="Logo" style={{ height: '40px' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Simulador de Generador</h1>
      </div>
      <div id="resumen-generador">
        {/* El contenido del resumen sigue igual */}
        {/* ... */}
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
