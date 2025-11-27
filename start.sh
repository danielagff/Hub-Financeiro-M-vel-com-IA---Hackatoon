#!/bin/bash

echo "========================================"
echo "  Hackatoon FMU - Iniciando Serviços"
echo "========================================"
echo ""

# Verifica se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "ERRO: Docker não encontrado!"
    echo "Por favor, instale o Docker."
    exit 1
fi

echo "Docker encontrado!"
echo ""

# Verifica se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "ERRO: Docker Compose não encontrado!"
    echo "Por favor, instale o Docker Compose."
    exit 1
fi

echo "Docker Compose encontrado!"
echo ""

echo "Iniciando serviços (MongoDB, PostgreSQL e App)..."
docker-compose up

