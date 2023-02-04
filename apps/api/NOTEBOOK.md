
## Performance para pouso THR 33
```sql
SELECT 
  [callsign] AS 'CALLSIGN',
  [type] AS 'TIPO',
  CONVERT(VARCHAR(10),[15-33],3) AS 'DATA',
  CONVERT(VARCHAR(5),[15-33],108) AS 'HORA',
  DATEDIFF(SECOND,[33 1],[15-33]) AS 'Δ 1nm 33',
  DATEDIFF(SECOND,[33 2],[15-33]) AS 'Δ 2nm 33',
  DATEDIFF(SECOND,[33 3],[15-33]) AS 'Δ 3nm 33',
  DATEDIFF(SECOND,[33 4],[15-33]) AS 'Δ 4nm 33',
  DATEDIFF(SECOND,[33 5],[15-33]) AS 'Δ 5nm 33',
  DATEDIFF(SECOND,[33 6],[15-33]) AS 'Δ 6nm 33',
  DATEDIFF(SECOND,[33 7],[15-33]) AS 'Δ 7nm 33',
  DATEDIFF(SECOND,[33 8],[15-33]) AS 'Δ 8nm 33',
  DATEDIFF(SECOND,[33 9],[15-33]) AS 'Δ 9nm 33',
  DATEDIFF(SECOND,[33 10],[15-33]) AS 'Δ 10nm 33'
FROM
(
  SELECT
    [Flight].[id],
    [Flight].[callsign],
    [Flight].[type],
    [Flight].[rwy],
    [Flight].[time],
    [FlightLog].[waypoint],
    [FlightLog].[date]
  FROM [adsb].[FlightLog]
  INNER JOIN [adsb].[Flight]
  ON [id] = [flight]
  WHERE [type] IN ('A339','B763','A332','B744','MD11','B748','B77L','B762','A333','A359','B77W','B767','AT76','A20N','A320','B38M','B738','B733','B737','B734','B788','E195','E190','E295','A321','A21N')
) AS SourceTable
PIVOT
(
  MIN([date])
  FOR [waypoint] IN ("15-33","33 1","33 2","33 3","33 4","33 5","33 6","33 7","33 8","33 9","33 10")
) AS PivotDate
WHERE 
[15-33] IS NOT NULL AND
(
  ([33 4] IS NOT NULL AND DATEDIFF(SECOND,[33 4],[15-33]) BETWEEN 0 AND 600) OR
  ([33 5] IS NOT NULL AND DATEDIFF(SECOND,[33 5],[15-33]) BETWEEN 0 AND 600) OR
  ([33 6] IS NOT NULL AND DATEDIFF(SECOND,[33 6],[15-33]) BETWEEN 0 AND 600) OR
  ([33 7] IS NOT NULL AND DATEDIFF(SECOND,[33 7],[15-33]) BETWEEN 0 AND 600) OR
  ([33 8] IS NOT NULL AND DATEDIFF(SECOND,[33 8],[15-33]) BETWEEN 0 AND 600)
);
```

## Performance para pouso THR 15
```sql
SELECT 
  [callsign] AS 'CALLSIGN',
  [type] AS 'TIPO',
  CONVERT(VARCHAR(10),[15-33],3) AS 'DATA',
  CONVERT(VARCHAR(5),[15-33],108) AS 'HORA',
  DATEDIFF(SECOND,[15 1],[15-33]) AS 'Δ 1nm 15',
  DATEDIFF(SECOND,[15 2],[15-33]) AS 'Δ 2nm 15',
  DATEDIFF(SECOND,[15 3],[15-33]) AS 'Δ 3nm 15',
  DATEDIFF(SECOND,[15 4],[15-33]) AS 'Δ 4nm 15',
  DATEDIFF(SECOND,[15 5],[15-33]) AS 'Δ 5nm 15',
  DATEDIFF(SECOND,[15 6],[15-33]) AS 'Δ 6nm 15',
  DATEDIFF(SECOND,[15 7],[15-33]) AS 'Δ 7nm 15',
  DATEDIFF(SECOND,[15 8],[15-33]) AS 'Δ 8nm 15',
  DATEDIFF(SECOND,[15 9],[15-33]) AS 'Δ 9nm 15',
  DATEDIFF(SECOND,[15 10],[15-33]) AS 'Δ 10nm 15'
FROM
(
  SELECT
    [Flight].[id],
    [Flight].[callsign],
    [Flight].[type],
    [Flight].[rwy],
    [Flight].[time],
    [FlightLog].[waypoint],
    [FlightLog].[date]
  FROM [adsb].[FlightLog]
  INNER JOIN [adsb].[Flight]
  ON [id] = [flight]
  WHERE [type] IN ('A339','B763','A332','B744','MD11','B748','B77L','B762','A333','A359','B77W','B767','AT76','A20N','A320','B38M','B738','B733','B737','B734','B788','E195','E190','E295','A321','A21N')
) AS SourceTable
PIVOT
(
  MIN([date])
  FOR [waypoint] IN ("15-33","15 1","15 2","15 3","15 4","15 5","15 6","15 7","15 8","15 9","15 10")
) AS PivotDate
WHERE 
[15-33] IS NOT NULL AND
(
  ([15 4] IS NOT NULL AND DATEDIFF(SECOND,[15 4],[15-33]) BETWEEN 0 AND 600) OR
  ([15 5] IS NOT NULL AND DATEDIFF(SECOND,[15 5],[15-33]) BETWEEN 0 AND 600) OR
  ([15 6] IS NOT NULL AND DATEDIFF(SECOND,[15 6],[15-33]) BETWEEN 0 AND 600) OR
  ([15 7] IS NOT NULL AND DATEDIFF(SECOND,[15 7],[15-33]) BETWEEN 0 AND 600) OR
  ([15 8] IS NOT NULL AND DATEDIFF(SECOND,[15 8],[15-33]) BETWEEN 0 AND 600)
);
```

## Ocupação de pista
```sql
SELECT
  [type] AS 'TIPO',
  CONVERT(VARCHAR(10),[15-33],3) AS 'DATA',
  CONVERT(VARCHAR(5),[15-33],108) AS 'HORA',
  DATEDIFF(SECOND,[15-33],[A]) AS 'ΔT THR-A',
  DATEDIFF(SECOND,[15-33],[B]) AS 'ΔT THR-B',
  DATEDIFF(SECOND,[15-33],[F]) AS 'ΔT THR-F',
  DATEDIFF(SECOND,[15-33],[E]) AS 'ΔT THR-E',
  DATEDIFF(SECOND,[15-33],[H]) AS 'ΔT THR-H',
  DATEDIFF(SECOND,[15-33],[D]) AS 'ΔT THR-D'
FROM
(
  SELECT
    [Flight].[id],
    [Flight].[type],
    [FlightLog].[waypoint],
    [FlightLog].[date]
  FROM [adsb].[FlightLog]
  INNER JOIN [adsb].[Flight]
  ON [id] = [flight]
  -- WHERE [waypoint] IN ('A','B','D','H','F','E')
  -- WHERE [type] IN ('A339','B763','A332','B744','MD11','B748','B77L','B762','A333','A359','B77W','B767','AT76','A20N','A320','B38M','B738','B733','B737','B734','B788','E195','E190','E295','A321','A21N')
) AS SourceTable
PIVOT
(
  MIN([date])
  FOR [waypoint] IN ([15-33],[A],[B],[F],[E],[D],[H])
) AS PivotDate
WHERE 
[15-33] IS NOT NULL 
AND ( [A] IS NOT NULL OR [B] IS NOT NULL OR [E] IS NOT NULL OR [F] IS NOT NULL OR [D] IS NOT NULL OR [H] IS NOT NULL)
-- AND
-- (
--   ( [A] IS NOT NULL AND DATEDIFF(SECOND,[15-33],[A]) BETWEEN 20 AND 120 ) OR
--   ( [B] IS NOT NULL AND DATEDIFF(SECOND,[15-33],[B]) BETWEEN 20 AND 120 ) OR
--   ( [F] IS NOT NULL AND DATEDIFF(SECOND,[15-33],[F]) BETWEEN 20 AND 120 ) OR
--   ( [E] IS NOT NULL AND DATEDIFF(SECOND,[15-33],[E]) BETWEEN 20 AND 120 ) 
-- ) AND 
-- [destination] = 'SBKP';

-- (
--   [15 1] IS NOT NULL OR
--   [15 2] IS NOT NULL OR
--   [15 3] IS NOT NULL OR
--   [15 4] IS NOT NULL OR
--   [15 5] IS NOT NULL OR
--   [15 6] IS NOT NULL OR
--   [15 7] IS NOT NULL OR
--   [15 8] IS NOT NULL OR
--   [15 9] IS NOT NULL OR
--   [15 10] IS NOT NULL
-- );
```