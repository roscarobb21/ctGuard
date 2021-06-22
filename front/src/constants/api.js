const api = {
    backaddr : "http://localhost:3001",
    authUser:"/api",
    admin:"/admin",
    routes:{
        login:"/login",
        navbarMsgNumber:"/msgQueue",
        clearChatMsgQueue:"/clearChatMsgQueue?id=",
        chatroomNotifications:"/notificationsForChatRooms",
        chat:"/chat?id=",
        clearNotificationQ:"/clearCommentQueue?id=",
        appendComment:"/appendComment",
        recomment:"/recomment",
        myID:"/myid",
        postComment:"/comment",
        subscribe:"/subscribe?id=",
        popular:"/popular",
        changeTheme:"/change_theme",
        changeTimeline:"/change_timeline",
        changeBio:"/change_bio"
    },
    adminRoutes:{
        postResponse:"/response",
        pushNews:"/push_news",
    },
    cdn: "http://localhost:5000",
    postMedia : {
        p360 : "/postMedia/360/__360__",
        p720 : "/postMedia/720/__720__",
        p1080 : "/postMedia/1080/__1080__"
    },
    avatarMedia:{
        p128:"/avatarUploads/128/__128__",
        p256:"/avatarUploads/256/__256__",
        p512:"/avatarUploads/512/__512__",
        p1080:"/avatarUploads/1080/__1080__",
    },
    deAnon:{
        p128:"/deAnon/128/__128__",
        p256:"/deAnon/256/__256__",
        p512:"/deAnon/512/__512__",
        p1080:"/deAnon/1080/__1080__",
    },
    achivements:"/api/MyAchivements",
}

export default api;