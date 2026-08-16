package com.personal.finance.backend.common.controller;

import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    public String index(){
        return "Hello my app";
    }
}
