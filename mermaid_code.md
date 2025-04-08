graph TD
    Start[User Opens App] --> Auth{Authenticated?}
    Auth -->|No| Login[Login/Signup Flow]
    Auth -->|Yes| Home[Home Feed]
    Login --> Home
    
    subgraph "Navigation"
        Home --> Profile[User Profile]
        Home --> Compose[Compose Post]
        Home --> Market[Marketplace]
        Home --> Notif[Notifications]
        Profile --> Home
        Compose --> Home
        Market --> Home
        Notif --> Home
    end
    
    subgraph "Home Feed Interactions"
        Home --> ViewPost[View Post Details]
        ViewPost --> Like[Like Post]
        ViewPost --> Dislike[Dislike Post]
        ViewPost --> Comment[Comment on Post]
        ViewPost --> Repost[Repost]
        ViewPost --> BookmarkPost[Bookmark Post]
        Like --> ViewPost
        Dislike --> ViewPost
        Comment --> ViewPost
        Repost --> ViewPost
        BookmarkPost --> ViewPost
    end
    
    subgraph "Post Composition"
        Compose --> TextEntry[Enter Text 0-280 chars]
        TextEntry --> MediaOption{Add Media?}
        MediaOption -->|Yes| AttachMedia[Attach Photos/Videos]
        MediaOption -->|No| PollOption{Create Poll?}
        AttachMedia --> PollOption
        PollOption -->|Yes| CreatePoll[Add Poll Options]
        PollOption -->|No| ScheduleOption{Schedule Post?}
        CreatePoll --> ScheduleOption
        ScheduleOption -->|Yes| SetSchedule[Set Date/Time]
        ScheduleOption -->|No| PublishPost[Publish Post]
        SetSchedule --> PublishPost
        PublishPost --> Home
    end
    
    subgraph "Post Management"
        ViewPost --> PostOptions[Post Options Menu]
        PostOptions --> EditOption{Edit Post?}
        PostOptions --> DeleteOption{Delete Post?}
        EditOption -->|Yes| EditTime{Within 60 min?}
        EditOption -->|No| ViewPost
        EditTime -->|Yes| EditPost[Edit Post Content]
        EditTime -->|No| EditDisabled[Edit Option Disabled]
        EditPost --> PublishEdit[Save Changes]
        PublishEdit --> ViewPost
        EditDisabled --> ViewPost
        DeleteOption -->|Yes| ConfirmDelete{Confirm Delete?}
        DeleteOption -->|No| ViewPost
        ConfirmDelete -->|Yes| DeletePost[Delete Post]
        ConfirmDelete -->|No| ViewPost
        DeletePost --> Home
    end
    
    subgraph "Marketplace"
        Market --> BrowseItems[Browse Items]
        Market --> FilterCategories[Filter by Categories]
        Market --> CreateListing[Create New Listing]
        BrowseItems --> ViewItem[View Item Details]
        FilterCategories --> BrowseItems
        ViewItem --> ContactSeller[Contact Seller]
        ViewItem --> SaveItem[Save Item]
        CreateListing --> FillDetails[Fill Item Details]
        FillDetails --> AddImages[Add Item Images]
        AddImages --> SetPrice[Set Price]
        SetPrice --> PublishListing[Publish Listing]
        PublishListing --> Market
    end
    
    subgraph "User Profile"
        Profile --> ViewPosts[View User Posts]
        Profile --> ViewListings[View User Listings]
        Profile --> ViewFollowers[View Followers]
        Profile --> ViewFollowing[View Following]
        Profile --> EditProfile[Edit Profile]
        ViewPosts --> ViewPost
        ViewListings --> ViewItem
        EditProfile --> UpdateBio[Update Bio]
        EditProfile --> UpdatePhoto[Update Profile Photo]
        EditProfile --> UpdateSettings[Update Settings]
        UpdateBio --> Profile
        UpdatePhoto --> Profile
        UpdateSettings --> Profile
    end

Twitter-Style Microblogging App with Integrated Marketplace:
    A modern social media platform that combines the familiar microblogging experience with an integrated marketplace, allowing users to share thoughts and sell items in one seamless interface.

Home Feed: Clean, scrollable timeline displaying posts in reverse chronological order with engagement options (like, dislike, comment, repost)

Post Composition: 280-character limit with media attachments, poll creation, and post scheduling capabilities

Marketplace Integration: Dedicated feed for browsing items/services with category filtering

User Profiles: Customizable profiles showing posts, marketplace listings, follower stats, and bio

Post Management: Edit posts within 60 minutes, delete anytime, and bookmark dislike favorite content





[![](https://mermaid.ink/img/pako:eNqNV9ty2zgM_RWOnnORHdd2_bA7SZzMZiZNPeu0O7uKHxgLsTiRSI1ENU2d_PsSvEiULDv1g0SA5wAgCILyNliLGIJZsClonpD7-QMn6reUtJDRtxIK8jUHXpLzPF-R4-M_yHklky0-gEu2phLiP98NB5UIebsTb-RWbBiP9PN0yTa8ysl1Kl5WHei_UL6Rv0QGET7INUBsIZqqPeKM0ZlnWT2aYB-CO_qDbahkgj8EZhJ_2hQyF4V4YimYdVhh1YO7FFkuSojsmyxEKftwX2jxDDIyrzyl615rd0Kyp0g_MUEquNKD2TA6K8Of8747Yxz2TGgnHT3weE-26hSTGy6hoGsdW2_mvjN4wSxEOND5IHOQlKX-UhxIM27ZM0T46GavhZqzMkWgfR_Eqnxkqsgi-yaCH4T_DTkGbF77QBdCPGcqm3ptTuia1avws9BMubj7Z12k_bMmsj2TfmA9kP2bqgmmdFj3IPgVdQ8_5RWXxWt0hZuvZRIeD6chWSe08Pe1hpqih5jRrzna3p7HsZHdmdfV2QCaM30uJV0neioyY7JIhBTl6XcWg_DddfnYPhYiTa3PywJUl9Ea36vnwJz1muGdtVrXBGbM4UyEq8EBMZjWKW0zMaTlOoG4SsGG5URdPH5gjQMdV5vWwNr6Jr4lSDcVqTGZK2On9yzzW00PVyetekxZmejatuNuaXvWTdYairf4RvnbvUWDv1BON4BHwK_C1gHEgU13pJVWUFXAq9YG1DjNu4qZlbc43Ml6Fz-HFKTbKyPscBqbTfpRh9ne_sNkoi6gcUgyxg-wMPG7x9mZaRvWO1OHr46nOonc354WDS2jQvUc-phCbJjWtVN2yE2ezR6iLlrSH0AuE8o30KrxBrKnKfne9zVEL8_eIRP8iRWZmdxayWL9XO6w-7PZMtd4MbJOqrfDq0O8fvuNod-ud-8bwK9176a-KMRLCTcSsjIyY6KFVS_6mqWqK1-qw74RBYMyMgry-EoaZT_VNJxbVkrGN5Ftl3fq2rYqj-XFVO8nSuaax1HPNd8Nrbu69knXRsz1zVWHlktIUygiKxEjrvZwsFJ1PLpkcbTqNla7KJe01MaL-UoPrMDhzDdsHN9kqlOV-grQJCN7nBpjAgO5KNjatGQ9ajdVrfIPntsO14d396IN9L4vPyo9_2vWrz3_y9LVeGl21lBQXu3H20h8ilMdYF2ri068QGFptfghBbPjUTrJ8Si6r9kvedM8d77k6-Xu6VL-8lqF3-mentdveayq7YKJyIyIGq4-gutPHEdw01r5IVUVkcm-ZTvZI9Yh-X9uutPa2yGAM7yLUSUXHKk_giwOZrKo4CjIoMgoisEWIQ-B-tunemMwU8NYFSuW37vi5JT_J0TmaIWoNkkwe6JpqaRKu50zqgo4q7WF8qa6iqi4DGbDMNRGgtk2-BnMjoeDwfBkHA7C6XQ4Dqej6egoeFX68Sg8GQ7Pws-Ts8mn6WQ0eD8KfmnHw5PR5_FoMpkMzsJPw-loMHn_HwCEs88?type=png)](https://mermaid.live/edit#pako:eNqNV9ty2zgM_RWOnnORHdd2_bA7SZzMZiZNPeu0O7uKHxgLsTiRSI1ENU2d_PsSvEiULDv1g0SA5wAgCILyNliLGIJZsClonpD7-QMn6reUtJDRtxIK8jUHXpLzPF-R4-M_yHklky0-gEu2phLiP98NB5UIebsTb-RWbBiP9PN0yTa8ysl1Kl5WHei_UL6Rv0QGET7INUBsIZqqPeKM0ZlnWT2aYB-CO_qDbahkgj8EZhJ_2hQyF4V4YimYdVhh1YO7FFkuSojsmyxEKftwX2jxDDIyrzyl615rd0Kyp0g_MUEquNKD2TA6K8Of8747Yxz2TGgnHT3weE-26hSTGy6hoGsdW2_mvjN4wSxEOND5IHOQlKX-UhxIM27ZM0T46GavhZqzMkWgfR_Eqnxkqsgi-yaCH4T_DTkGbF77QBdCPGcqm3ptTuia1avws9BMubj7Z12k_bMmsj2TfmA9kP2bqgmmdFj3IPgVdQ8_5RWXxWt0hZuvZRIeD6chWSe08Pe1hpqih5jRrzna3p7HsZHdmdfV2QCaM30uJV0neioyY7JIhBTl6XcWg_DddfnYPhYiTa3PywJUl9Ea36vnwJz1muGdtVrXBGbM4UyEq8EBMZjWKW0zMaTlOoG4SsGG5URdPH5gjQMdV5vWwNr6Jr4lSDcVqTGZK2On9yzzW00PVyetekxZmejatuNuaXvWTdYairf4RvnbvUWDv1BON4BHwK_C1gHEgU13pJVWUFXAq9YG1DjNu4qZlbc43Ml6Fz-HFKTbKyPscBqbTfpRh9ne_sNkoi6gcUgyxg-wMPG7x9mZaRvWO1OHr46nOonc354WDS2jQvUc-phCbJjWtVN2yE2ezR6iLlrSH0AuE8o30KrxBrKnKfne9zVEL8_eIRP8iRWZmdxayWL9XO6w-7PZMtd4MbJOqrfDq0O8fvuNod-ud-8bwK9176a-KMRLCTcSsjIyY6KFVS_6mqWqK1-qw74RBYMyMgry-EoaZT_VNJxbVkrGN5Ftl3fq2rYqj-XFVO8nSuaax1HPNd8Nrbu69knXRsz1zVWHlktIUygiKxEjrvZwsFJ1PLpkcbTqNla7KJe01MaL-UoPrMDhzDdsHN9kqlOV-grQJCN7nBpjAgO5KNjatGQ9ajdVrfIPntsO14d396IN9L4vPyo9_2vWrz3_y9LVeGl21lBQXu3H20h8ilMdYF2ri068QGFptfghBbPjUTrJ8Si6r9kvedM8d77k6-Xu6VL-8lqF3-mentdveayq7YKJyIyIGq4-gutPHEdw01r5IVUVkcm-ZTvZI9Yh-X9uutPa2yGAM7yLUSUXHKk_giwOZrKo4CjIoMgoisEWIQ-B-tunemMwU8NYFSuW37vi5JT_J0TmaIWoNkkwe6JpqaRKu50zqgo4q7WF8qa6iqi4DGbDMNRGgtk2-BnMjoeDwfBkHA7C6XQ4Dqej6egoeFX68Sg8GQ7Pws-Ts8mn6WQ0eD8KfmnHw5PR5_FoMpkMzsJPw-loMHn_HwCEs88)