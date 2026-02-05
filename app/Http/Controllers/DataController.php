<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use Google\Client;
use Google\Service\Sheets;

class DataController extends Controller
{
    public function fetchData()
    {
        $user = Auth::user();

        if (!$user->google_token) {
            return response()->json(['error' => 'User not authenticated with Google'], 401);
        }

        $client = new Client();
        $client->setAccessToken($user->google_token);

        if ($client->isAccessTokenExpired()) {
            if ($user->google_refresh_token) {
                $client->fetchAccessTokenWithRefreshToken($user->google_refresh_token);
                $newToken = $client->getAccessToken();
                $user->update(['google_token' => $newToken['access_token']]);
            } else {
                 return response()->json(['error' => 'Token expired and no refresh token'], 401);
            }
        }

        $service = new Sheets($client);
        $spreadsheetId = env('GOOGLE_SHEET_ID');
        $range = 'Sheet1!A2:F'; // Assuming data starts from A2 (A1 is header)

        try {
            $response = $service->spreadsheets_values->get($spreadsheetId, $range);
            $values = $response->getValues();

            if (empty($values)) {
                return response()->json([]);
            }

            $formattedData = array_map(function ($row) {
                return [
                    'name' => $row[0] ?? '',
                    'photo' => $row[1] ?? '',
                    'age' => $row[2] ?? '',
                    'country' => $row[3] ?? '',
                    'interest' => $row[4] ?? '',
                    'net_worth' => $row[5] ?? '',
                ];
            }, $values);

            return response()->json($formattedData);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch data: ' . $e->getMessage()], 500);
        }
    }
}
