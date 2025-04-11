/* --- ENCABEZADO DE LA PÁGINA --- */
header {
  background-color: #ff2b61;
  color: white;
  padding: 20px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 15px;
}

header img {
  height: 50px;
}

header h1 {
  margin: 0;
  font-size: 24px;
  font-family: "Segoe UI", sans-serif;
}

/* --- CUERPO GENERAL --- */
body {
  font-family: "Segoe UI", sans-serif;
  background-color: #fefefe;
  color: #333;
  margin: 0;
  padding: 0;
}

#precios-container {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
}

/* --- TÍTULOS DE CATEGORÍA Y SUBCATEGORÍA --- */
.category-title {
  font-size: 22px;
  font-weight: bold;
  color: #ff2b61;
  margin-top: 40px;
  margin-bottom: 10px;
}

.subcategory-title {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  margin-top: 30px;
  margin-bottom: 5px;
}

/* --- TABLAS --- */
.table-container {
  overflow-x: auto;
  margin-bottom: 40px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

thead {
  background-color: #ffe5ed;
}

th, td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* --- RESPONSIVO --- */
@media (max-width: 600px) {
  header {
    flex-direction: column;
    text-align: center;
  }

  header img {
    margin-bottom: 10px;
  }

  .category-title, .subcategory-title {
    text-align: center;
  }
}
