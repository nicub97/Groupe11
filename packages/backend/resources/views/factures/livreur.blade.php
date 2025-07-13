<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture Livreur {{ $factureNumber }}</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Facture n° {{ $factureNumber }}</h1>
    <p>Date : {{ $date }}</p>
    <p>Livreur : {{ $livreur->prenom }} {{ $livreur->nom }} (ID #{{ $livreur->id }})</p>
    <h3>Détails de l'étape</h3>
    <table>
        <tr><th>Lieu de départ</th><td>{{ $etape->lieu_depart }}</td></tr>
        <tr><th>Lieu d'arrivée</th><td>{{ $etape->lieu_arrivee }}</td></tr>
        <tr><th>Montant</th><td>{{ number_format($montant, 2) }} €</td></tr>
    </table>
</body>
</html>
