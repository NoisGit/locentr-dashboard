export const accessActivityLog = [
    {
        "id": "1",
        "date": 1746554397,
        "events": [
            {
                "type": "ACCESS-GRANTED",
                "dateTime": 1746356928,
                "description": "Acceso concedido en porter\u00eda sur"
            }
        ]
    },
    {
        "id": "2",
        "date": 1746450000,
        "events": [
            {
                "type": "ACCESS-GRANTED",
                "dateTime": 1746459376,
                "description": "Acceso concedido en porter\u00eda norte"
            },
            {
                "type": "ALERT-ENTRY",
                "dateTime": 1746458211,
                "description": "Ingreso inusual detectado"
            }
        ]
    },
    {
        "id": "3",
        "date": 1746350000,
        "events": [
            {
                "dateTime": 1746580000,
                "type": "DOOR-OPEN",
                "description": "Puerta abierta manualmente"
            },
            {
                "type": "ACCESS-FAILED",
                "dateTime": 1746578417,
                "description": "Intento de ingreso fallido"
            },
            {
                "dateTime": 1746574027,
                "type": "CAMERA-LOG",
                "description": "Imagen registrada en c\u00e1mara 3"
            }
        ]
    }
]

export const accessLogData = [
    {
        "id": "1",
        "date": 1646554397,
        "events": [
            {
                "type": "ENTRY",
                "dateTime": 1646580000,
                "status": 0,
                "userName": "Angelina Gotelli",
                "userImg": "/img/avatars/thumb-1.jpg",
                "location": "Porter\u00eda Sur"
            },
            {
                "type": "COMMENT",
                "dateTime": 1646578417,
                "userName": "Max Alexander",
                "userImg": "/img/avatars/thumb-3.jpg",
                "comment": "Ingreso sin novedad."
            }
        ]
    },
    {
        "id": "2",
        "date": 1646450000,
        "events": [
            {
                "type": "ENTRY",
                "dateTime": 1646458211,
                "userName": "Jessica Wells",
                "userImg": "/img/avatars/thumb-8.jpg",
                "status": 1,
                "location": "Porter\u00eda Norte"
            },
            {
                "type": "ALERT",
                "dateTime": 1646457743,
                "userName": "Arlene Pierce",
                "description": "Alerta por identificaci\u00f3n no v\u00e1lida."
            }
        ]
    },
    {
        "id": "3",
        "date": 1646350000,
        "events": [
            {
                "type": "ENTRY",
                "dateTime": 1646356928,
                "userName": "Eugene Stewart",
                "userImg": "/img/avatars/thumb-5.jpg",
                "status": 0,
                "location": "Entrada principal"
            },
            {
                "type": "COMMENT",
                "dateTime": 1646356103,
                "userName": "Camila Simmmons",
                "userImg": "/img/avatars/thumb-9.jpg",
                "comment": "Ingreso con acompa\u00f1ante autorizado."
            }
        ]
    }
]
