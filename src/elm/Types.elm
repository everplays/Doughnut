module Types exposing (..)

import Date exposing (Date)

type alias PodcastId = Int

type alias Podcast =
  { id : PodcastId
  , title : String
  , feed : String
  , description : String
  , link : String
  , author : String
  , pubDate : Date
  , language : String
  , copyright : String
  , categories : List String
  , imageUrl : String
  , lastParsed : Date
  , createdAt : Date
  , updatedAt : Date
  }

type alias EpisodeId = Int

type alias Episode =
  { id : EpisodeId
  , podcastId : PodcastId
  , title : String
  , description : String
  , guid : String
  , pubDate : Date
  , link : String
  , enclosureUrl : String
  , enclosureSize : Int
  , favourite : Bool
  , downloaded : Bool
  , played : Bool
  , playPosition : Int
  , duration : Int
  , createdAt : Date
  , updatedAt : Date
  }

type alias PodcastWrapped =
  { podcast : Podcast
  , episodes : List Episode
  , loading : Bool
  , selected : Bool
  }

type alias GlobalState =
  { serverPort : Int
  }

assetServerUrl : GlobalState -> String
assetServerUrl config =
  "http://localhost:" ++ (toString config.serverPort)

type alias PlayerModel =
  { state : PlayerState
  , seeking : Bool
  , seekingPosition : Float
  , adjustingVolume : Int
  , showSeekDetail : Bool
  }

type alias PlayerState =
  { pause : Bool
  , volume : Int
  , duration : Float
  , position : Float
  , title : String
  , ready : Bool
  , episodeId : Int
  }

type alias PodcastLoadingIpc =
  { id : Int
  , loading : Bool
  }

type alias TaskState =
  { processing : Bool
  , tasks : List LibraryTask
  }

type alias LibraryTask =
  { id : String
  , progress : Int
  , description : String
  }

type alias Settings =
  { libraryPath : String
  }