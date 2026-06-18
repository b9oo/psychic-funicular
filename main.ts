//% color=#FF0088 icon="\uf1e2" block="Geometry Dash"
namespace geometrydash {

    export enum GameMode {
        //% block="Cube"
        Cube,
        //% block="Ship"
        Ship,
        //% block="Ball"
        Ball,
        //% block="UFO"
        UFO
    }

    let player: Sprite = null;
    let currentMode = GameMode.Cube;
    let velocityY = 0;
    let gravity = 380;           // pixels per second²
    let isOnGround = false;

    // =============================================
    // Tiles
    // =============================================
    //% block="set GD tiles"
    //% group="Tiles"
    export function setGDTiles() {
        // You will replace these with real pixel art in the MakeCode editor
        scene.setTile(1, img`
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
            2222222222222222
        `, true); // Solid platform

        scene.setTile(2, img`
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
            1111111111111111
        `, true); // Spike (deadly)

        console.log("Geometry Dash tiles loaded");
    }

    // =============================================
    // Player & Mode
    // =============================================
    //% block="set player $sprite to mode $mode"
    //% sprite.shadow="variables_get"
    //% mode.defl=GameMode.Cube
    //% group="Player"
    export function setPlayer(sprite: Sprite, mode: GameMode) {
        if (!sprite) return;
        player = sprite;
        currentMode = mode;
        sprite.setKind(SpriteKind.Player);
        sprite.setFlag(SpriteFlag.StayInScreen, false);
        
        velocityY = 0;
        console.log("Player mode set to " + mode);
    }

    //% block="change mode to $mode"
    //% mode.defl=GameMode.Ship
    //% group="Player"
    export function changeMode(mode: GameMode) {
        if (!player) return;
        currentMode = mode;
        velocityY = 0;
    }

    // =============================================
    // Main Update Loop
    // =============================================
    game.onUpdate(function () {
        if (!player) return;

        // Horizontal movement
        if (controller.left.isPressed()) player.vx = -120;
        else if (controller.right.isPressed()) player.vx = 120;
        else player.vx = 0;

        switch (currentMode) {
            case GameMode.Cube:
                updateCube();
                break;
            case GameMode.Ship:
                updateShip();
                break;
            case GameMode.Ball:
                updateBall();
                break;
            case GameMode.UFO:
                updateUFO();
                break;
        }

        // Death on spikes / hazards
        if (player.tileKindAt(TileDirection.Center, 2)) {
            game.over();
        }
    });

    function updateCube() {
        // Jump
        if (controller.A.isPressed() && isOnGround) {
            velocityY = -220;
            isOnGround = false;
        }

        // Gravity
        velocityY += gravity * (1/60);
        player.vy = velocityY;

        // Ground check
        isOnGround = player.tileKindAt(TileDirection.Bottom, 1) || 
                     player.tileKindAt(TileDirection.Bottom, 2);
        if (isOnGround && velocityY > 0) velocityY = 0;
    }

    function updateShip() {
        if (controller.A.isPressed()) {
            player.vy = -110;
        } else {
            player.vy = 90;
        }
    }

    function updateBall() {
        if (controller.A.justPressed()) {
            gravity = -gravity;
        }
        velocityY += gravity * (1/30);
        player.vy = velocityY;
    }

    function updateUFO() {
        if (controller.A.isPressed()) {
            player.vy = -95;
        } else {
            player.vy += 6;
        }
    }

    // =============================================
    // Level
    // =============================================
    //% block="load level $tilemap"
    //% tilemap.shadow="tilemap_editor"
    //% group="Level"
    export function loadLevel(tilemap: tiles.TileMapData) {
        tiles.setCurrentTilemap(tilemap);
        scene.cameraFollowSprite(player);
    }

    //% block="add orb at col $col row $row"
    //% group="Objects"
    export function addOrb(col: number, row: number) {
        let orb = sprites.create(img`
            . . . . . . . . 
            . . 6 6 6 6 . . 
            . 6 6 6 6 6 6 . 
            . 6 6 6 6 6 6 . 
            . 6 6 6 6 6 6 . 
            . . 6 6 6 6 . . 
            . . . . . . . . 
        `, SpriteKind.Food);
        tiles.placeOnTile(orb, tiles.getTileLocation(col, row));
        
        sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, (p, o) => {
            if (o === orb) {
                velocityY = -280; // big jump boost
                o.destroy();
            }
        });
    }
}
