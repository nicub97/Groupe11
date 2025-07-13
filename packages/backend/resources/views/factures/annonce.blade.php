<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture {{ $factureNumber }}</title>
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
    <p>{{ ucfirst($role) }} : {{ $utilisateur->prenom }} {{ $utilisateur->nom }} (ID #{{ $utilisateur->id }})</p>
    <h3>Détail de l'annonce</h3>
    <table>
        <tr><th>Titre</th><td>{{ $annonce->titre }}</td></tr>
        <tr><th>Description</th><td>{{ $annonce->description }}</td></tr>
        <tr><th>Montant</th><td>{{ number_format($montant, 2) }} €</td></tr>
    </table>
</body>
</html>
