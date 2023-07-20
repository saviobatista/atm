BEGIN TRY

BEGIN TRAN;

-- CreateSchema
EXEC sp_executesql N'CREATE SCHEMA [adsb];';;

-- CreateTable
CREATE TABLE [adsb].[Aerodrome] (
    [icao] CHAR(4) NOT NULL,
    CONSTRAINT [PK__Aerodrom__9DF9D88483306943] PRIMARY KEY CLUSTERED ([icao])
);

-- CreateTable
CREATE TABLE [adsb].[Aircraft] (
    [modes] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [registration] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Aircraft_pkey] PRIMARY KEY CLUSTERED ([modes])
);

-- CreateTable
CREATE TABLE [adsb].[Flight] (
    [id] CHAR(36) NOT NULL,
    [aerodrome] CHAR(4) NOT NULL,
    [modes] CHAR(6) NOT NULL,
    [type] CHAR(4) NOT NULL,
    [registration] VARCHAR(10) NOT NULL,
    [callsign] VARCHAR(20),
    [origin] CHAR(4) NOT NULL,
    [destination] CHAR(4) NOT NULL,
    [date] DATE NOT NULL,
    [time] TIME NOT NULL,
    [path] geography,
    [rwy] VARCHAR(3),
    CONSTRAINT [PK__Flight__3213E83F1AFA8EA5] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [adsb].[FlightLog] (
    [flight] CHAR(36) NOT NULL,
    [waypoint] VARCHAR(10) NOT NULL,
    [date] DATETIME NOT NULL,
    [position] geography NOT NULL,
    [speed] INT,
    [altitude] INT,
    [last] DATETIME,
    [out] DATETIME,
    CONSTRAINT [PK__FlightLo__2B8149DDD919E5F0] PRIMARY KEY CLUSTERED ([flight],[waypoint])
);

-- CreateTable
CREATE TABLE [adsb].[hisMovement] (
    [PKMov] VARCHAR(36) NOT NULL,
    [FKStripMov] VARCHAR(36) NOT NULL,
    [DHMov] DATETIME NOT NULL,
    [CountMov] INT NOT NULL IDENTITY(1,1),
    [LocalityStrip] VARCHAR(15),
    [FlightLocation] VARCHAR(1),
    [IsMovement] SMALLINT,
    [MovModule] VARCHAR(20),
    [MovState] VARCHAR(3),
    [MovType] VARCHAR(3),
    [StatusClr] VARCHAR(5),
    [IntegrationFlag] TINYINT,
    [DTStrip] DATETIME,
    [DTOut] DATETIME,
    [DTEstimated] DATETIME,
    [DTPlanned] DATETIME,
    [DTSlot] DATETIME,
    [DTEvent] DATETIME,
    [DHEvent] DATETIME,
    [SQEvent] SMALLINT,
    [EventType] VARCHAR(3),
    [EventDesc] VARCHAR(50),
    [EventCount] SMALLINT,
    [EventTitle] VARCHAR(35),
    [AbortRadio] VARCHAR(50),
    [AbortReason] VARCHAR(50),
    [AbortRemark] VARCHAR(512),
    [UserEvent] VARCHAR(128),
    [IsLastEvent] TINYINT NOT NULL,
    [CallSign] VARCHAR(7),
    [aDep] VARCHAR(4),
    [aDes] VARCHAR(4),
    [Transponder] VARCHAR(4),
    [FlightType] VARCHAR(2),
    [FL] VARCHAR(5),
    [CruisingSpeed] VARCHAR(5),
    [POB] VARCHAR(3),
    [PAX] VARCHAR(3),
    [Endurance] VARCHAR(4),
    [AltnDest] VARCHAR(4),
    [Altn] VARCHAR(4),
    [Altn2] VARCHAR(4),
    [RegistrationMark] VARCHAR(10),
    [AcftType] VARCHAR(4),
    [AcftTypeOp] VARCHAR(4),
    [AcftTurbCat] VARCHAR(1),
    [AcftSpec] VARCHAR(1),
    [AcftCond] VARCHAR(1),
    [Acft] VARCHAR(6),
    [AcftPlan] VARCHAR(4),
    [Stand] VARCHAR(15),
    [StandOrigin] VARCHAR(15),
    [StandDest] VARCHAR(15),
    [StandBusy] TINYINT,
    [StandChecked] TINYINT,
    [Sid] VARCHAR(30),
    [Star] VARCHAR(30),
    [FixeIn] VARCHAR(7),
    [DTFixeIn] DATETIME,
    [FixeOut] VARCHAR(7),
    [DTFixeOut] DATETIME,
    [RVSM] VARCHAR(1),
    [Route] VARCHAR(1024),
    [RunWay] VARCHAR(15),
    [FlightRule] VARCHAR(1),
    [CondMet] VARCHAR(2),
    [RV] VARCHAR(2) NOT NULL,
    [Siap] VARCHAR(10),
    [FLPlan] VARCHAR(5),
    [ClrLimit] VARCHAR(10),
    [Equipment] VARCHAR(70),
    [EET] VARCHAR(4),
    [EOBT] VARCHAR(4),
    [ETA] VARCHAR(4),
    [TKO] VARCHAR(4),
    [ETOI] VARCHAR(4),
    [ETOO] VARCHAR(4),
    [NumAcfts] SMALLINT,
    [CrossType] VARCHAR(3),
    [SectorTma] VARCHAR(3),
    [SectorFir] VARCHAR(3),
    [InstructionCode] VARCHAR(max),
    [MovTypeTma] VARCHAR(3),
    [LastFL] VARCHAR(5),
    [HcpDesSector] VARCHAR(2),
    [HcpDepSector] VARCHAR(2),
    [HcpRoute] VARCHAR(60),
    [DLinkDCL] SMALLINT,
    [DelayReason] VARCHAR(50),
    [DelayRemark] VARCHAR(70),
    [FlightKind] CHAR(1),
    [FlightAlternate] TINYINT,
    [FlightAlternateReason] VARCHAR(100),
    [aDesBeforeAltn] VARCHAR(4),
    [FirstAppContact] VARCHAR(50),
    [CoordACC] VARCHAR(100),
    [aDepDesc] VARCHAR(150),
    [aDesDesc] VARCHAR(150),
    [DCLStatus] TINYINT,
    [HasDCLRemark] BIT,
    [Transition] VARCHAR(7),
    [OperationalRemarks] NVARCHAR(200),
    [SpecialFlightAuthorization] VARCHAR(250),
    [AccAddresses] VARCHAR(max),
    [DHAware] DATETIME,
    [DHAwareRefused] DATETIME,
    [AppAddresses] VARCHAR(max),
    [OriginalRoute] VARCHAR(1024),
    [IDPlan] VARCHAR(8),
    [OrderOP] SMALLINT,
    [TOBT] DATETIME,
    [PushOp] VARCHAR(4),
    [AlertFlag] TINYINT,
    [TSAT] DATETIME,
    [ASAT] DATETIME,
    [AOBT] DATETIME,
    [TTOT] DATETIME,
    [CTOT] DATETIME,
    [TSATFlag] TINYINT,
    [TSATWindow] TINYINT,
    [TSATOutWindowReason] VARCHAR(100),
    [AmsUniqueID] VARCHAR(20),
    [AmsLinkUniqueID] VARCHAR(20),
    [AtpCpi] VARCHAR(15),
    [AmsOfb] DATETIME,
    CONSTRAINT [PK__hisMovem__B2F086DE92E3E3F4] PRIMARY KEY CLUSTERED ([PKMov])
);

-- CreateTable
CREATE TABLE [adsb].[Runway] (
    [aerodrome] CHAR(4) NOT NULL,
    [runway] VARCHAR(10) NOT NULL,
    [polygon] geography NOT NULL,
    CONSTRAINT [PK__Runway__8CDAA8C318F1772F] PRIMARY KEY CLUSTERED ([aerodrome],[runway])
);

-- CreateTable
CREATE TABLE [adsb].[Taxiway] (
    [aerodrome] CHAR(4) NOT NULL,
    [label] VARCHAR(3) NOT NULL,
    [coordinates] geography NOT NULL,
    CONSTRAINT [PK__Taxiway__4BEA5856DA940867] PRIMARY KEY CLUSTERED ([aerodrome],[label])
);

-- CreateTable
CREATE TABLE [adsb].[Threshold] (
    [aerodrome] CHAR(4) NOT NULL,
    [label] VARCHAR(3) NOT NULL,
    CONSTRAINT [PK__Threshol__4BEA58565EDC9B34] PRIMARY KEY CLUSTERED ([aerodrome],[label])
);

-- CreateTable
CREATE TABLE [adsb].[UnknowAircraft] (
    [modes] CHAR(6) NOT NULL,
    [lastUpdate] DATETIME NOT NULL,
    CONSTRAINT [PK__UnknowAi__0B7E2697492CBE05] PRIMARY KEY CLUSTERED ([modes])
);

-- CreateTable
CREATE TABLE [adsb].[Waypoint] (
    [aerodrome] CHAR(4) NOT NULL,
    [threshold] VARCHAR(3) NOT NULL,
    [label] VARCHAR(10) NOT NULL,
    [point] geography NOT NULL,
    CONSTRAINT [PK__Waypoint__3FADA35DCA25E444] PRIMARY KEY CLUSTERED ([aerodrome],[threshold],[label])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
