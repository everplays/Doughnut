module Preferences.Icons exposing (..)

import Svg exposing (..)
import Svg.Attributes exposing (..)
import Html.Attributes as A

libraryIcon : Svg msg
libraryIcon =
  svg [ width "25px", height "25px", viewBox "149 300 25 25" ] 
    [ g
      [ stroke "none"
      , strokeWidth "1"
      , fill "none"
      , fillRule "evenodd"
      , transform "translate(149.000000, 300.000000)"
      ]
      [ Svg.path [d "M20.7042254,0.214788732 L4.08802817,0.214788732 C3.78375488,0.217028557 3.51533283,0.414439481 3.42253521,0.704225352 L0.088028169,10.778169 L0.088028169,24.1584507 C0.088028169,24.5473836 0.403320599,24.8626761 0.792253521,24.8626761 L24.0316901,24.8626761 C24.4206231,24.8626761 24.7359155,24.5473836 24.7359155,24.1584507 L24.7359155,10.778169 L21.3732394,0.704225352 C21.2800401,0.413210553 21.0097989,0.215507822 20.7042254,0.214788732 Z M22.2887324,9.36971831 L2.52112676,9.36971831 C2.40753502,9.37001178 2.30077847,9.31548802 2.23442446,9.22329087 C2.16807045,9.13109371 2.15026986,9.01254862 2.18661972,8.90492958 L4.52464789,1.86267606 C4.57499786,1.71289756 4.71896044,1.615003 4.87676056,1.62323944 L19.9507042,1.62323944 C20.1094581,1.61547112 20.2537343,1.71502166 20.3028169,1.86619718 L22.6408451,8.9084507 C22.6769317,9.01863886 22.6564595,9.13952992 22.586106,9.23169309 C22.5157524,9.32385626 22.4045362,9.37547701 22.2887324,9.36971831 L22.2887324,9.36971831 Z", fill "#404040", fillRule "nonzero"] []
      , polygon [fill "#FFFFFF", points "16.5441176 16.8382353 9.92647059 20.8088235 9.92647059 12.8676471"] []
      ]
    ]