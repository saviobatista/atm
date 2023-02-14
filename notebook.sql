DECLARE @tipos TABLE (tipo VARCHAR(4));
-- ############ PARAMETROS DEFINIDOS AQUI - INICIO ############
DECLARE
  @inicio VARCHAR(10) = '2022-01-01',
  @fim    VARCHAR(23) = '2022-12-31 23:59:59.999';
  -- Para agrupar coloque varios na mesma linha e para retirar da consulta coloque hifen duplo no inicio para
  -- ser ignorado como este comentário "--"
INSERT INTO @tipos VALUES
('A320'), ('A321'), ('A20N'), ('A21N'),
  ('A339'), ('A332'), ('A333'), ('A359'),
  ('B744'), ('B748'), ('B77L'), ('B77W'), ('B788'), ('MD11'),
  ('B763'), ('B762'), ('B767'),
  ('B38M'), ('B738'), ('B737'), ('B733'), ('B734'),
  ('E195'), ('E190'), ('E295'),
  ('AT76'),
('');
-- ############ PARAMETROS DEFINIDOS AQUI - FIM ############

-----------------------------------------------------------------------------------------------
-- 1) Planilha de Aproximação 15:
-- Callsign
-- Tipo
-- Data
-- Hora Pouso (hh:mm:ss)
-- Vel. inst 4NM
-- Δ 4NM - THR
-- Vel. inst 5NM
-- Δ 5NM - THR
-- Vel. inst 6NM
-- Δ 6NM - THR
-- Vel. inst 7NM
-- Δ 7NM - THR
-- Vel. inst 8NM
-- Δ 8NM - THR
SELECT 
  [Callsign] AS 'CALLSIGN',
  [Type] AS 'TIPO',
  CONVERT(VARCHAR(10), [thr].[date],103) AS 'DATA',
  CONVERT(VARCHAR(8), [thr].[date],108) AS 'HORA POUSO',
  [w4].[speed] AS 'Vel. inst 4NM',
  DATEDIFF(second,[w4].[date],[thr].[date]) AS 'Δ 4NM - THR',
  [w5].[speed] AS 'Vel. inst 5NM',
  DATEDIFF(second,[w5].[date],[thr].[date]) AS 'Δ 5NM - THR',
  [w6].[speed] AS 'Vel. inst 6NM',
  DATEDIFF(second,[w6].[date],[thr].[date]) AS 'Δ 6NM - THR',
  [w7].[speed] AS 'Vel. inst 7NM',
  DATEDIFF(second,[w7].[date],[thr].[date]) AS 'Δ 7NM - THR',
  [w8].[speed] AS 'Vel. inst 8NM',
  DATEDIFF(second,[w8].[date],[thr].[date]) AS 'Δ 8NM - THR'
FROM [adsb].[Flight]
INNER JOIN [adsb].[FlightLog] [thr] ON [id] = [thr].[flight] AND [thr].[waypoint] = '15-33'
INNER JOIN [adsb].[FlightLog] [w4] ON [id] = [w4].[flight] AND [w4].[waypoint] = '15 4'
INNER JOIN [adsb].[FlightLog] [w5] ON [id] = [w5].[flight] AND [w5].[waypoint] = '15 5'
INNER JOIN [adsb].[FlightLog] [w6] ON [id] = [w6].[flight] AND [w6].[waypoint] = '15 6'
INNER JOIN [adsb].[FlightLog] [w7] ON [id] = [w7].[flight] AND [w7].[waypoint] = '15 7'
INNER JOIN [adsb].[FlightLog] [w8] ON [id] = [w8].[flight] AND [w8].[waypoint] = '15 8'
WHERE [thr].[date] > [w4].[date]
AND [thr].[date] BETWEEN @inicio AND @fim
AND [adsb].[Flight].[type] IN (SELECT [tipo] FROM @tipos)
ORDER BY [thr].[date] ASC;
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------
-- 2) Planilha de Aproximação 33:

-- Callsign
-- Tipo
-- Data
-- Hora Pouso (hh:mm:ss)
-- Vel. inst 4NM
-- Δ 4NM - THR
-- Vel. inst 5NM
-- Δ 5NM - THR
-- Vel. inst 6NM
-- Δ 6NM - THR
-- Vel. inst 7NM
-- Δ 7NM - THR
-- Vel. inst 8NM
-- Δ 8NM - THR
SELECT 
  [Callsign] AS 'CALLSIGN',
  [Type] AS 'TIPO',
  CONVERT(VARCHAR(10), [thr].[date],103) AS 'DATA',
  CONVERT(VARCHAR(8), [thr].[date],108) AS 'HORA POUSO',
  [w4].[speed] AS 'Vel. inst 4NM',
  DATEDIFF(second,[w4].[date],[thr].[date]) AS 'Δ 4NM - THR',
  [w5].[speed] AS 'Vel. inst 5NM',
  DATEDIFF(second,[w5].[date],[thr].[date]) AS 'Δ 5NM - THR',
  [w6].[speed] AS 'Vel. inst 6NM',
  DATEDIFF(second,[w6].[date],[thr].[date]) AS 'Δ 6NM - THR',
  [w7].[speed] AS 'Vel. inst 7NM',
  DATEDIFF(second,[w7].[date],[thr].[date]) AS 'Δ 7NM - THR',
  [w8].[speed] AS 'Vel. inst 8NM',
  DATEDIFF(second,[w8].[date],[thr].[date]) AS 'Δ 8NM - THR'
FROM [adsb].[Flight]
INNER JOIN [adsb].[FlightLog] [thr] ON [id] = [thr].[flight] AND [thr].[waypoint] = '15-33'
LEFT JOIN [adsb].[FlightLog] [w4] ON [id] = [w4].[flight] AND [w4].[waypoint] = '33 4'
LEFT JOIN [adsb].[FlightLog] [w5] ON [id] = [w5].[flight] AND [w5].[waypoint] = '33 5'
LEFT JOIN [adsb].[FlightLog] [w6] ON [id] = [w6].[flight] AND [w6].[waypoint] = '33 6'
LEFT JOIN [adsb].[FlightLog] [w7] ON [id] = [w7].[flight] AND [w7].[waypoint] = '33 7'
LEFT JOIN [adsb].[FlightLog] [w8] ON [id] = [w8].[flight] AND [w8].[waypoint] = '33 8'
WHERE [thr].[date] > [w4].[date]
AND [thr].[date] BETWEEN @inicio AND @fim
AND [adsb].[Flight].[type] IN (SELECT [tipo] FROM @tipos)
ORDER BY [thr].[date] ASC;
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------
-- 3) Planilha ROT 15:

-- Callsign
-- Tipo
-- Data
-- Hora Pouso (hh:mm:ss)
-- TWY (que liberou a pista)
-- ROT (tempo de ocupação de pista)
SELECT 
  [Callsign] AS 'CALLSIGN',
  [Type] AS 'TIPO',
  CONVERT(VARCHAR(10), [thr].[date],103) AS 'DATA',
  CONVERT(VARCHAR(8), [thr].[date],108) AS 'HORA POUSO',
CASE 
  WHEN [a].[date] IS NOT NULL THEN 'A' 
  WHEN [b].[date] IS NOT NULL THEN 'B' 
  WHEN [f].[date] IS NOT NULL THEN 'F' 
  WHEN [e].[date] IS NOT NULL THEN 'E' 
  ELSE 'DEU RUIM' END
AS 'TWY',
DATEDIFF(SECOND,[thr].[date],CASE 
  WHEN [a].[date] IS NOT NULL THEN [a].[date] 
  WHEN [b].[date] IS NOT NULL THEN [b].[date]
  WHEN [f].[date] IS NOT NULL THEN [f].[date]
  WHEN [e].[date] IS NOT NULL THEN [e].[date]
  ELSE [thr].[date] END)
AS 'ROT'
FROM [adsb].[Flight]
INNER JOIN [adsb].[FlightLog] [thr] ON [id] = [thr].[flight] AND [thr].[waypoint] = '15-33'
LEFT JOIN [adsb].[FlightLog] [a] ON [id] = [a].[flight] AND [a].[waypoint] = 'A'
LEFT JOIN [adsb].[FlightLog] [b] ON [id] = [b].[flight] AND [b].[waypoint] = 'B'
LEFT JOIN [adsb].[FlightLog] [f] ON [id] = [f].[flight] AND [f].[waypoint] = 'F'
LEFT JOIN [adsb].[FlightLog] [e] ON [id] = [e].[flight] AND [e].[waypoint] = 'E'
WHERE [thr].[date] BETWEEN @inicio AND @fim
AND [adsb].[Flight].[type] IN (SELECT [tipo] FROM @tipos)
AND DATEDIFF(SECOND,[thr].[date],CASE 
  WHEN [a].[date] IS NOT NULL THEN [a].[date] 
  WHEN [b].[date] IS NOT NULL THEN [b].[date]
  WHEN [f].[date] IS NOT NULL THEN [f].[date]
  WHEN [e].[date] IS NOT NULL THEN [e].[date]
  ELSE [thr].[date] END) > 20
AND ( [a].[date] IS NOT NULL OR [b].[date] IS NOT NULL OR [f].[date] IS NOT NULL OR [e].[date] IS NOT NULL )
ORDER BY [thr].[date] ASC;
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------
-- 4) Planilha ROT 33:

-- Callsign
-- Tipo
-- Data
-- Hora Pouso (hh:mm:ss)
-- TWY (que liberou a pista)
-- ROT (tempo de ocupação de pista)
SELECT 
  [Callsign] AS 'CALLSIGN',
  [Type] AS 'TIPO',
  CONVERT(VARCHAR(10), [thr].[date],103) AS 'DATA',
  CONVERT(VARCHAR(8), [thr].[date],108) AS 'HORA POUSO',
CASE 
  WHEN [a].[date] IS NOT NULL THEN 'A' 
  WHEN [b].[date] IS NOT NULL THEN 'B' 
  WHEN [h].[date] IS NOT NULL THEN 'H' 
  WHEN [d].[date] IS NOT NULL THEN 'D' 
  ELSE 'DEU RUIM' END
AS 'TWY',
DATEDIFF(SECOND,[thr].[date],CASE 
  WHEN [a].[date] IS NOT NULL THEN [a].[date] 
  WHEN [b].[date] IS NOT NULL THEN [b].[date]
  WHEN [h].[date] IS NOT NULL THEN [h].[date]
  WHEN [d].[date] IS NOT NULL THEN [d].[date]
  ELSE [thr].[date] END)
AS 'ROT'
FROM [adsb].[Flight]
INNER JOIN [adsb].[FlightLog] [thr] ON [id] = [thr].[flight] AND [thr].[waypoint] = '15-33'
LEFT JOIN [adsb].[FlightLog] [a] ON [id] = [a].[flight] AND [a].[waypoint] = 'A'
LEFT JOIN [adsb].[FlightLog] [b] ON [id] = [b].[flight] AND [b].[waypoint] = 'B'
LEFT JOIN [adsb].[FlightLog] [h] ON [id] = [h].[flight] AND [h].[waypoint] = 'H'
LEFT JOIN [adsb].[FlightLog] [d] ON [id] = [d].[flight] AND [d].[waypoint] = 'D'
WHERE [thr].[date] BETWEEN @inicio AND @fim
AND [adsb].[Flight].[type] IN (SELECT [tipo] FROM @tipos)
AND DATEDIFF(SECOND,[thr].[date],CASE 
  WHEN [a].[date] IS NOT NULL THEN [a].[date] 
  WHEN [b].[date] IS NOT NULL THEN [b].[date]
  WHEN [h].[date] IS NOT NULL THEN [h].[date]
  WHEN [d].[date] IS NOT NULL THEN [d].[date]
  ELSE [thr].[date] END) > 20
AND ( [a].[date] IS NOT NULL OR [b].[date] IS NOT NULL OR [h].[date] IS NOT NULL OR [d].[date] IS NOT NULL )
ORDER BY [thr].[date] ASC;
-----------------------------------------------------------------------------------------------